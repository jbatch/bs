import { execSync } from 'node:child_process';
import {
  BlockStatement,
  BoundStatement,
  VariableDeclarationStatement,
} from '../binding/BoundStatement';
import { SymbolTable } from '../binding/SymbolTable';
import { FunctionSymbol, TypeSymbol } from '../symbols/Symbol';
import fs from 'node:fs';
import llvm from 'llvm-bindings';
import {
  AssignmentExpression,
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
    this.createFunction(
      'main',
      llvm.FunctionType.get(this.builder.getInt32Ty(), [], false),
      this.globalEnvironment
    );

    // Compiler main body
    this.gen(this.rootNode, this.globalEnvironment);

    // return 0
    this.builder.CreateRet(this.builder.getInt32(0));
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

  private createFunction(name: string, functionType: llvm.FunctionType, env: Env) {
    const fnProto = this.createFunctionProto(name, functionType, env);
    const fnBody = this.createFunctionBlock(fnProto);
  }

  private createFunctionBlock(fnProto: llvm.Function) {
    const entry = this.createBB('entry', fnProto);
    this.builder.SetInsertPoint(entry);
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

  private gen(statement: BoundStatement, env: Env) {
    switch (statement.kind) {
      case 'BlockStatement':
        const blockEnv = new Env(env);
        for (const s of statement.statements) {
          this.gen(s, blockEnv);
        }
        return;
      case 'ExpressionStatement':
        return this.genExpression(statement.expression, env);
      case 'VariableDeclarationStatement':
        return this.genVariableDeclaration(statement, env);
      case 'ReturnStatement':
      case 'LabelStatement':
      case 'GoToStatement':
      case 'ConditionalGoToStatement':
      default:
        console.warn(
          `\x1b[31mERROR\x1b[0m: Code generation for node type ${statement.kind} not implemented yet.`
        );
        return this.builder.CreateUnreachable();
    }
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
    env.define(statement.variable.name, localVar);
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
        return this.getAssignmentExpression(expression, env);
      case 'UnaryExpression':
      case 'BinaryExpression':
      case 'OperatorAssignmentExpression':
      case 'PostfixUnaryExpression':
      case 'ErrorExpression':
        console.warn(
          `\x1b[31mERROR\x1b[0m: Code generation for node type ${expression.kind} not implemented yet.`
        );
        return this.builder.CreateUnreachable();
    }
  }

  private genVariableExpression(expression: VariableExpression, env: Env): llvm.Value {
    console.log('Looking up ', expression.variable.name);
    const variable = env.lookup(expression.variable.name);
    return this.builder.CreateLoad(this.getLlvmType(expression.variable.type), variable);
  }

  private getAssignmentExpression(expression: AssignmentExpression, env: Env): llvm.Value {
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
    }
    throw new Error('Not supported type');
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
