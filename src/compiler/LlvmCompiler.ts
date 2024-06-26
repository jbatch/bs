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

  usedBuiltIns: Set<string> = new Set();

  context = new llvm.LLVMContext();
  module = new llvm.Module('bsc', this.context);
  builder = new llvm.IRBuilder(this.context);
  mainStartIp: llvm.IRBuilder.InsertPoint = 0;
  blocks: Record<string, llvm.BasicBlock> = {};
  functions: Record<string, llvm.Function> = {};

  // For Scanf
  buffer: llvm.GlobalVariable | undefined = undefined;
  fmt: llvm.GlobalVariable | undefined = undefined;

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
    this.generateLabelBlocks(this.rootNode, this.functions['main']);

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
    this.generateLabelBlocks(functionBody, fn);
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
    if (symbol.type.name === 'void') {
      this.builder.CreateRetVoid();
    }
  }

  private generateLabelBlocks(rootNode: BlockStatement, parentFunction: llvm.Function) {
    const stack: BoundStatement[] = [];
    stack.push(...[...rootNode.statements].reverse());
    while (stack.length > 0) {
      const cur = stack.pop()!;
      if (cur.kind === 'BlockStatement') {
        stack.push(...[...cur.statements].reverse());
      }
      if (cur.kind === 'LabelStatement') {
        const basicBlock = llvm.BasicBlock.Create(this.context, cur.label.name, parentFunction);
        this.blocks[cur.label.name] = basicBlock;
      }
    }
  }

  private setupExternFunctions() {
    const bytePtrTy = this.builder.getInt8PtrTy();
    const int32Ty = this.builder.getInt32Ty();
    const int64Ty = this.builder.getInt64Ty();
    const boolTy = this.builder.getInt1Ty();
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
        if (expression.left.type.name === 'string' && expression.right.type.name === 'string') {
          const r = this.stringConcat(left, right);
          return r;
        }
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

  private stringConcat(left: llvm.Value, right: llvm.Value): llvm.Value {
    /**
     %len1 = call i64 @strlen(i8* %str1) # get length of str1
     %len2 = call i64 @strlen(i8* %str2) # get length of str2
     %total_len = add i64 %len1, %len2    # total length = len1 + len2
     %mem = call i8* @malloc(i64 %total_len)  # Allocate memory
     call void @llvm.memcpy.p0i8.p0i8.i64(i8* %mem, i8* %str1, i64 %len1, i1 0)  # copy str1 to mem
     call void @llvm.memcpy.p0i8.p0i8.i64(i8* getelementptr inbounds(i8, i8* %mem, i64 %len1), i8* %str2, i64 %len2, i1 0)  # copy str2 to mem[len1]
     ret i8* %mem  # return pointer to concatenated string
     */

    const l1 = this.genStrlen(left);
    const l2 = this.genStrlen(right);
    const sum = this.builder.CreateAdd(l1, l2);
    const len = this.builder.CreateAdd(sum, this.builder.getInt64(1)); // Add one to account for \0
    const mem = this.genMalloc(len);

    this.genMemcpy(mem, left, l1);
    this.genMemcpy(this.builder.CreateGEP(this.builder.getInt8Ty(), mem, l1), right, l2);
    return mem;
  }

  private randInRange(min: llvm.Value, max: llvm.Value) {
    /**
     %rand = call i32 @rand() ; Call 'rand' to get a random integer.
     %range = sub i32 %high, %low ; Compute the size of the range.
     %rand_mod_range = srem i32 %rand, %range ; Limit the random number to the size of the range.
     %rand_in_range = add i32 %rand_mod_range, %low ; Shift the random number into the desired range.
     ret i32 %rand_in_range
     */
    const r = this.genRand();
    const range = this.builder.CreateSub(max, min);
    const rMod = this.builder.CreateSRem(r, range);
    return this.builder.CreateAdd(rMod, min);
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
    const value = this.genExpression(expression.expression, env);
    switch (expression.type.name) {
      case 'string':
        switch (expression.expression.type.name) {
          case 'int':
            return this.intToString(value);
          case 'boolean':
            return this.boolToString(value);
        }
      case 'int':
        return this.stringToInt(value);
      case 'bool':
    }
    console.warn(
      `\x1b[31mERROR\x1b[0m: Code generation for type cast ${expression.expression.type.name} to ${expression.type.name} not implemented yet.`
    );
    return this.builder.CreateUnreachable();
  }

  private intToString(value: llvm.Value) {
    const fmt = this.builder.CreateGlobalStringPtr('%d', 'format_str');
    return this.genSprintf(fmt, value);
  }

  private boolToString(value: llvm.Value): llvm.Value {
    throw new Error('Method not implemented.');
  }

  private stringToInt(value: llvm.Value): llvm.Value {
    return this.genAtoi(value);
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
      case 'rand':
        return this.genRandCall(expression, env);
      case 'input':
        return this.genInputCall();
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

  private genRandCall(expression: CallExpression, env: Env): llvm.Value {
    const min = this.genExpression(expression.args[0], env);
    const max = this.genExpression(expression.args[1], env);
    return this.randInRange(min, max);
  }

  private genInputCall(): llvm.Value {
    return this.genScanf();
  }

  private genPrint(expression: CallExpression, env: Env): llvm.Value {
    if (!this.usedBuiltIns.has('printf')) {
      this.module.getOrInsertFunction(
        'printf',
        llvm.FunctionType.get(this.builder.getInt32Ty(), [this.builder.getInt8PtrTy()], true)
      );
      this.usedBuiltIns.add('printf');
    }
    const printFn = this.module.getFunction('printf')!;
    const args = [this.genExpression(expression.args[0], env)];
    return this.builder.CreateCall(printFn, args);
  }

  private genSprintf(fmt: llvm.Constant, value: llvm.Value) {
    if (!this.usedBuiltIns.has('sprintf')) {
      this.module.getOrInsertFunction(
        'sprintf',
        llvm.FunctionType.get(
          this.builder.getInt32Ty(),
          [this.builder.getInt8PtrTy(), this.builder.getInt8PtrTy()],
          true
        )
      );
      this.usedBuiltIns.add('sprintf');
    }

    const buffer = this.builder.CreateAlloca(this.builder.getInt8Ty(), this.builder.getInt32(20));
    const sprintfFn = this.module.getFunction('sprintf')!;
    const args = [buffer, fmt, value];
    this.builder.CreateCall(sprintfFn, args);
    return buffer;
  }

  private genMalloc(len: llvm.Value) {
    if (!this.usedBuiltIns.has('malloc')) {
      this.module.getOrInsertFunction(
        'malloc',
        llvm.FunctionType.get(this.builder.getInt8PtrTy(), [this.builder.getInt64Ty()], false)
      );
      this.usedBuiltIns.add('malloc');
    }
    const malloc = this.module.getFunction('malloc')!;
    return this.builder.CreateCall(malloc, [len]);
  }

  private genStrlen(stringValue: llvm.Value) {
    if (!this.usedBuiltIns.has('strlen')) {
      this.module.getOrInsertFunction(
        'strlen',
        llvm.FunctionType.get(this.builder.getInt64Ty(), [this.builder.getInt8PtrTy()], false)
      );
      this.usedBuiltIns.add('strlen');
    }
    const strlen = this.module.getFunction('strlen')!;
    return this.builder.CreateCall(strlen, [stringValue]);
  }

  private genMemcpy(src: llvm.Value, dest: llvm.Value, n: llvm.Value) {
    if (!this.usedBuiltIns.has('memcpy')) {
      this.module.getOrInsertFunction(
        'llvm.memcpy.p0i8.p0i8.i64',
        llvm.FunctionType.get(
          this.builder.getVoidTy(),
          [
            this.builder.getInt8PtrTy(),
            this.builder.getInt8PtrTy(),
            this.builder.getInt64Ty(),
            this.builder.getInt1Ty(),
          ],
          false
        )
      );
      this.usedBuiltIns.add('memcpy');
    }
    const memcopy = this.module.getFunction('llvm.memcpy.p0i8.p0i8.i64')!;
    return this.builder.CreateCall(memcopy, [src, dest, n, this.builder.getFalse()]);
  }

  private genRand() {
    if (!this.usedBuiltIns.has('rand')) {
      this.module.getOrInsertFunction(
        'rand',
        llvm.FunctionType.get(this.builder.getInt32Ty(), [], false)
      );
      // If this is the first time rand has been called add a call to srand and time too
      this.module.getOrInsertFunction(
        'srand',
        llvm.FunctionType.get(this.builder.getVoidTy(), [this.builder.getInt64Ty()], false)
      );
      this.module.getOrInsertFunction(
        'time',
        llvm.FunctionType.get(this.builder.getInt64Ty(), [this.builder.getInt32Ty()], false)
      );
      const srand = this.module.getFunction('srand')!;
      const time = this.module.getFunction('time')!;
      this.builder.CreateCall(srand, [this.builder.CreateCall(time, [this.builder.getInt32(0)])]);
      this.usedBuiltIns.add('rand');
    }
    const rand = this.module.getFunction('rand')!;
    return this.builder.CreateCall(rand, []);
  }

  private genScanf() {
    if (!this.usedBuiltIns.has('scanf')) {
      this.module.getOrInsertFunction(
        'scanf',
        llvm.FunctionType.get(this.builder.getInt32Ty(), [this.builder.getInt8PtrTy()], true)
      );
      // If this is the first call set up a global fmt string and buffer to store input
      const fmtString = llvm.ConstantDataArray.getString(this.context, '%s', true);
      this.fmt = new llvm.GlobalVariable(
        this.module,
        fmtString.getType(),
        true,
        llvm.GlobalVariable.LinkageTypes.InternalLinkage,
        fmtString,
        'scanf_fmt_str'
      );
      const arrayType = llvm.ArrayType.get(this.builder.getInt8Ty(), 100);
      this.buffer = new llvm.GlobalVariable(
        this.module,
        arrayType,
        false,
        llvm.GlobalVariable.LinkageTypes.InternalLinkage,
        llvm.Constant.getNullValue(arrayType),
        'scanf_buffer'
      );
      this.usedBuiltIns.add('scanf');
    }
    const scanfFn = this.module.getFunction('scanf')!;
    this.builder.CreateCall(scanfFn, [
      this.builder.CreatePointerCast(this.fmt!, this.builder.getInt8PtrTy()),
      this.builder.CreatePointerCast(this.buffer!, this.builder.getInt8PtrTy()),
    ]);
    return this.builder.CreatePointerCast(this.buffer!, this.builder.getInt8PtrTy());
  }

  private genAtoi(numberString: llvm.Value): llvm.Value {
    if (!this.usedBuiltIns.has('atoi')) {
      this.module.getOrInsertFunction(
        'atoi',
        llvm.FunctionType.get(this.builder.getInt32Ty(), [this.builder.getInt8PtrTy()], false)
      );
      this.usedBuiltIns.add('atoi');
    }
    const atoi = this.module.getFunction('atoi')!;
    return this.builder.CreateCall(atoi, [numberString]);
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
