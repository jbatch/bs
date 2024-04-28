import { execSync } from 'node:child_process';
import {
  BlockStatement,
  BoundStatement,
  ConditionalGoToStatement,
  GoToStatement,
  LabelStatement,
  ReturnStatement,
  VariableDeclarationStatement,
} from '../binding/BoundStatement';
import { SymbolTable } from '../binding/SymbolTable';
import { FunctionSymbol, TypeSymbol } from '../symbols/Symbol';
import fs from 'node:fs';
import llvm from 'llvm-bindings';
import {
  AssignmentExpression,
  BinaryExpression,
  BoundExpression,
  CallExpression,
  LiteralExpression,
  TypeCastExpression,
  VariableExpression,
} from '../binding/BoundExpression';

export class LlvmCompiler {
  rootNode: BlockStatement;
  functionTable: SymbolTable<FunctionSymbol, BlockStatement>;
  globalEnvironment: Env = new Env();

  context = new llvm.LLVMContext();
  module = new llvm.Module('bsc', this.context);
  builder = new llvm.IRBuilder(this.context);
  blocks: Record<string, llvm.BasicBlock> = {};
  functions: Record<string, llvm.Function> = {};

  constructor(
    rootNode: BlockStatement,
    functionTable: SymbolTable<FunctionSymbol, BlockStatement>
  ) {
    this.rootNode = rootNode;
    this.functionTable = functionTable;
  }

  compile() {
    this.setupExternFunctions();
    this.setupGlobalEnvironment();
    this.moduleInit();

    const llvmIR = this.module.print();
    this.writeToFile(llvmIR);
    this.compileLlvm();
  }

  moduleInit() {
    // Create main function prototype
    const { block: mainBlock, fn: mainFn } = this.createFunction(
      'main',
      llvm.FunctionType.get(this.builder.getInt32Ty(), [], false),
      this.globalEnvironment
    );
    this.blocks['main'] = mainBlock;
    this.functions['main'] = mainFn;

    // Generate function declarations
    this.generateFunctions(this.functionTable, this.globalEnvironment);

    // Build basic blocks
    this.generateLabelBlocks(this.rootNode);

    // Compile main body
    this.builder.SetInsertPoint(this.blocks['main']);
    this.gen(this.rootNode, this.globalEnvironment);

    // return 0
    this.builder.CreateRet(this.builder.getInt32(0));
  }

  private generateFunctions(functionTable: SymbolTable<FunctionSymbol, BlockStatement>, env: Env) {
    for (const { symbol, value: body } of functionTable.symbols) {
      this.generateFunction(symbol, body, env);
    }
  }

  private generateFunction(symbol: FunctionSymbol, functionBody: BlockStatement, env: Env) {
    const { name, type, parameters } = symbol;
    const fnEnv = new Env(env);
    const fnType = llvm.FunctionType.get(
      this.getLlvmType(type),
      parameters.map((p) => this.getLlvmType(p.type)),
      false
    );
    const { fn, block } = this.createFunction(name, fnType, fnEnv);
    this.functions[name] = fn;
    this.builder.SetInsertPoint(block);
    // Give params names
    for (let i = 0; i < fn.arg_size(); i++) {
      const arg = fn.getArg(i);
      const param = parameters[i];
      arg.setName(param.name);

      const localVar = this.builder.CreateAlloca(
        this.getLlvmType(param.type),
        this.builder.getInt32(0),
        param.name
      );
      const value = fnEnv.define(param.name, localVar);
      this.builder.CreateStore(arg, value);
    }

    const functionResult = this.gen(functionBody, fnEnv);
  }

  private generateLabelBlocks(rootNode: BlockStatement) {
    const stack: BoundStatement[] = [];
    stack.push(...[...rootNode.statements].reverse());
    while (stack.length > 0) {
      const cur = stack.pop()!;
      if (cur.kind === 'BlockStatement') {
        stack.push(...[...cur.statements].reverse());
      }
      if (cur.kind === 'LabelStatement') {
        const basicBlock = llvm.BasicBlock.Create(
          this.context,
          cur.label.name,
          // TODO: Use stack for block parent once we support functions
          this.functions['main']
        );
        this.blocks[cur.label.name] = basicBlock;
      }
    }
  }

  private setupExternFunctions() {
    const bytePtrTy = this.builder.getInt8PtrTy();
    this.module.getOrInsertFunction(
      'printf',
      llvm.FunctionType.get(this.builder.getInt32Ty(), [bytePtrTy], true)
    );
    this.module.getOrInsertFunction(
      'sprintf',
      llvm.FunctionType.get(this.builder.getInt32Ty(), [bytePtrTy, bytePtrTy], true)
    );
  }

  private setupGlobalEnvironment() {
    const globals = { version: this.builder.getInt32(42) };

    for (const [name, value] of Object.entries(globals)) {
      const globalVariable = this.declareGlobalVariable(name, value, true);
      this.globalEnvironment.define(name, globalVariable);
    }
  }

  private createFunction(
    name: string,
    functionType: llvm.FunctionType,
    env: Env
  ): { fn: llvm.Function; block: llvm.BasicBlock } {
    const fnProto = this.createFunctionProto(name, functionType, env);
    const fnBody = this.createFunctionBlock(fnProto);
    return { fn: fnProto, block: fnBody };
  }

  private createFunctionBlock(fnProto: llvm.Function): llvm.BasicBlock {
    const entry = this.createBB('entry', fnProto);
    // this.builder.SetInsertPoint(entry);
    return entry;
  }

  private createBB(name: string, fnProto?: llvm.Function): llvm.BasicBlock {
    return llvm.BasicBlock.Create(this.context, name, fnProto);
  }

  private createFunctionProto(
    name: string,
    functionType: llvm.FunctionType,
    env: Env
  ): llvm.Function {
    const fn = llvm.Function.Create(
      functionType,
      llvm.Function.LinkageTypes.ExternalLinkage,
      name,
      this.module
    );
    llvm.verifyFunction(fn);
    env.define(name, fn);
    return fn;
  }

  private gen(statement: BoundStatement, env: Env): llvm.Value {
    switch (statement.kind) {
      case 'BlockStatement':
        const blockEnv = new Env(env);
        let last = undefined;
        for (const s of statement.statements) {
          last = this.gen(s, blockEnv);
        }
        if (last === undefined) {
          return this.builder.CreateUnreachable();
        }
        return last;
      case 'ExpressionStatement':
        return this.genExpression(statement.expression, env);
      case 'VariableDeclarationStatement':
        return this.genVariableDeclaration(statement, env);
      case 'LabelStatement':
        return this.genLabelStatement(statement);
      case 'ConditionalGoToStatement':
        return this.genConditionalGoTo(statement, env);
      case 'GoToStatement':
        return this.genGoTo(statement);
      case 'ReturnStatement':
        return this.genReturn(statement, env);
      default:
        console.warn(
          `\x1b[31mERROR\x1b[0m: Code generation for node type ${statement.kind} not implemented yet.`
        );
        return this.builder.CreateUnreachable();
    }
  }

  private genConditionalGoTo(statement: ConditionalGoToStatement, env: Env) {
    const cond = this.genExpression(statement.condition, env);
    return this.builder.CreateCondBr(
      cond,
      this.blocks[statement.ifLabel.name]!,
      this.blocks[statement.elseLabel.name]!
    );
  }

  private genGoTo(statement: GoToStatement) {
    return this.builder.CreateBr(this.blocks[statement.label.name]);
  }

  private genReturn(statement: ReturnStatement, env: Env) {
    if (statement.value === undefined) {
      // Void type
      return this.builder.CreateRetVoid();
    }
    const retValue = this.genExpression(statement.value, env);
    return this.builder.CreateRet(retValue);
  }

  private genLabelStatement(statement: LabelStatement) {
    const basicBlock = this.blocks[statement.label.name];
    this.builder.SetInsertPoint(basicBlock);
    return basicBlock;
  }

  private genVariableDeclaration(statement: VariableDeclarationStatement, env: Env) {
    const initializer: llvm.Constant = this.genExpression(
      statement.expression,
      env
    ) as llvm.Constant;
    const localVar = this.builder.CreateAlloca(
      this.getLlvmType(statement.variable.type),
      this.builder.getInt32(0),
      statement.variable.name
    );
    this.builder.CreateStore(initializer, localVar);
    return env.define(statement.variable.name, localVar);
  }

  private declareGlobalVariable(
    name: string,
    initializer: llvm.Constant,
    readonly: boolean = false
  ): llvm.GlobalVariable {
    const gv = new llvm.GlobalVariable(
      this.module,
      initializer.getType(),
      readonly,
      llvm.GlobalVariable.LinkageTypes.InternalLinkage,
      initializer,
      name
    );

    return gv;
  }

  private genExpression(expression: BoundExpression, env: Env): llvm.Value {
    switch (expression.kind) {
      case 'CallExpression':
        return this.genCallExpression(expression, env);
      case 'LiteralExpression':
        return this.genLiteralExpression(expression);
      case 'TypeCastExpression':
        return this.genTypeCast(expression, env);
      case 'VariableExpression':
        return this.genVariableExpression(expression, env);
      case 'AssignmentExpression':
        return this.genAssignmentExpression(expression, env);
      case 'BinaryExpression':
        return this.genBinaryExpression(expression, env);
      case 'UnaryExpression':
      case 'OperatorAssignmentExpression':
      case 'PostfixUnaryExpression':
      case 'ErrorExpression':
        console.warn(
          `\x1b[31mERROR\x1b[0m: Code generation for node type ${expression.kind} not implemented yet.`
        );
        return this.builder.CreateUnreachable();
    }
  }

  private genBinaryExpression(expression: BinaryExpression, env: Env): llvm.Value {
    const left = this.genExpression(expression.left, env);
    const right = this.genExpression(expression.right, env);
    switch (expression.operator.kind) {
      case 'Addition':
        return this.builder.CreateAdd(left, right);
      case 'Subtraction':
        return this.builder.CreateSub(left, right);
      case 'Multiplication':
        return this.builder.CreateMul(left, right);
      case 'Division':
        return this.builder.CreateSDiv(left, right);
      case 'BitwiseAnd':
        return this.builder.CreateAnd(left, right);
      case 'BitwiseOr':
        return this.builder.CreateOr(left, right);
      case 'BitwiseXor':
        return this.builder.CreateXor(left, right);
      case 'LogicalAnd':
        return this.builder.CreateAnd(left, right);
      case 'LogicalOr':
        return this.builder.CreateOr(left, right);
      case 'Equals':
        return this.builder.CreateICmpEQ(left, right);
      case 'NotEquals':
        return this.builder.CreateICmpNE(left, right);
      case 'LessThan':
        return this.builder.CreateICmpSLT(left, right);
      case 'LessThanOrEqual':
        return this.builder.CreateICmpSLE(left, right);
      case 'GreaterThan':
        return this.builder.CreateICmpSGT(left, right);
      case 'GreaterThanOrEqual':
        return this.builder.CreateICmpSLE(left, right);
    }
  }

  private genVariableExpression(expression: VariableExpression, env: Env): llvm.Value {
    const variable = env.lookup(expression.variable.name);
    return this.builder.CreateLoad(this.getLlvmType(expression.variable.type), variable);
  }

  private genAssignmentExpression(expression: AssignmentExpression, env: Env): llvm.Value {
    const variable = env.lookup(expression.variable.name);
    const value = this.genExpression(expression.expression, env);
    return this.builder.CreateStore(value, variable!);
  }

  private genTypeCast(expression: TypeCastExpression, env: Env): llvm.Value {
    switch (expression.type.name) {
      case 'string':
        const value = this.genExpression(expression.expression, env);
        switch (expression.expression.type.name) {
          case 'int':
            return this.intToString(value);
          case 'boolean':
            return this.boolToString(value);
        }
      case 'int':
      case 'bool':
    }
    console.warn(
      `\x1b[31mERROR\x1b[0m: Code generation for type cast ${expression.expression.type.name} to ${expression.type.name} not implemented yet.`
    );
    return this.builder.CreateUnreachable();
  }

  private boolToString(value: llvm.Value): llvm.Value {
    throw new Error('Method not implemented.');
  }

  private intToString(value: llvm.Value): llvm.Value {
    const fmt = this.builder.CreateGlobalStringPtr('%d', 'format_str');
    const buffer = this.builder.CreateAlloca(this.builder.getInt8Ty(), this.builder.getInt32(20));
    const sprintfFn = this.module.getFunction('sprintf')!;
    const args = [buffer, fmt, value];
    this.builder.CreateCall(sprintfFn, args);
    return buffer;
  }

  private genLiteralExpression(expression: LiteralExpression): llvm.Value {
    switch (expression.type.name) {
      case 'int':
        return this.builder.getInt32(Number(expression.value));
      case 'bool':
        return this.builder.getInt1(Boolean(expression.value));
      case 'string':
        return this.builder.CreateGlobalStringPtr(String(expression.value).replace(/\\n/g, '\n'));
    }
    console.warn(
      `\x1b[31mERROR\x1b[0m: Code generation for literal type ${expression.type.name} not implemented yet.`
    );
    return this.builder.CreateUnreachable();
  }

  private genCallExpression(expression: CallExpression, env: Env): llvm.Value {
    switch (expression.functionSymbol.name) {
      case 'print':
        return this.genPrint(expression, env);
    }
    const foundFunction = this.functions[expression.functionSymbol.name];
    if (foundFunction !== undefined) {
      const args = expression.args.map((arg) => this.genExpression(arg, env));
      return this.builder.CreateCall(foundFunction, args);
    }
    console.warn(
      `\x1b[31mERROR\x1b[0m: Code generation for function ${expression.functionSymbol.name} not implemented yet.`
    );
    return this.builder.CreateUnreachable();
  }

  private genPrint(expression: CallExpression, env: Env): llvm.Value {
    const printFn = this.module.getFunction('printf')!;
    const args = [this.genExpression(expression.args[0], env)];
    return this.builder.CreateCall(printFn, args);
  }

  private getLlvmType(bsType: TypeSymbol): llvm.Type {
    switch (bsType.name) {
      case 'int':
        return this.builder.getInt32Ty();
      case 'string':
        return this.builder.getInt8PtrTy();
      case 'bool':
        return this.builder.getInt1Ty();
      case 'void':
        return this.builder.getVoidTy();
    }
    throw new Error('Not supported type: ' + bsType.name);
  }

  private writeToFile(nasm: string) {
    fs.writeFileSync('build/llvm/out.ll', nasm);
  }

  private compileLlvm() {
    execSync('clang build/llvm/out.ll -o build/llvm/out');
    console.log('Wrote output to build/llvm/out');
  }
}

class Env {
  variables: Record<string, llvm.Value>;
  parent?: Env;
  constructor(parent?: Env) {
    this.parent = parent;
    this.variables = {};
  }

  define(name: string, value: llvm.Value) {
    this.variables[name] = value;
    return value;
  }

  lookup(name: string): llvm.Value {
    return this.resolve(name).variables[name];
  }

  private resolve(name: string): Env {
    if (this.variables[name] !== undefined) {
      return this;
    }

    if (this.parent === undefined) {
      throw new Error(`Variable ${name} not found`);
    }

    return this.parent.resolve(name);
  }
}
