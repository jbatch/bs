import { execSync } from 'node:child_process';
import { BlockStatement, BoundStatement } from '../binding/BoundStatement';
import { SymbolTable } from '../binding/SymbolTable';
import { FunctionSymbol } from '../symbols/Symbol';
import fs from 'node:fs';
import llvm from 'llvm-bindings';
import { BoundExpression, CallExpression, LiteralExpression } from '../binding/BoundExpression';

export class LlvmCompiler {
  rootNode: BlockStatement;
  functionTable: SymbolTable<FunctionSymbol, BlockStatement>;

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
    this.moduleInit();

    const llvmIR = this.module.print();
    this.writeToFile(llvmIR);
    this.compileLlvm();
  }

  moduleInit() {
    // Create main function prototype
    this.createFunction('main', llvm.FunctionType.get(this.builder.getInt32Ty(), [], false));

    // Compiler main body
    this.gen(this.rootNode);

    // return 0
    this.builder.CreateRet(this.builder.getInt32(0));
  }

  private setupExternFunctions() {
    const bytePtrTy = this.builder.getInt8PtrTy();
    this.module.getOrInsertFunction(
      'printf',
      llvm.FunctionType.get(this.builder.getInt32Ty(), [bytePtrTy], true)
    );
  }

  private createFunction(name: string, functionType: llvm.FunctionType) {
    const fnProto = this.createFunctionProto(name, functionType);
    const fnBody = this.createFunctionBlock(fnProto);
  }
  createFunctionBlock(fnProto: llvm.Function) {
    const entry = this.createBB('entry', fnProto);
    this.builder.SetInsertPoint(entry);
  }

  createBB(name: string, fnProto?: llvm.Function): llvm.BasicBlock {
    return llvm.BasicBlock.Create(this.context, name, fnProto);
  }

  private createFunctionProto(name: string, functionType: llvm.FunctionType): llvm.Function {
    const fn = llvm.Function.Create(
      functionType,
      llvm.Function.LinkageTypes.ExternalLinkage,
      name,
      this.module
    );
    llvm.verifyFunction(fn);
    return fn;
  }

  private gen(statement: BoundStatement) {
    switch (statement.kind) {
      case 'BlockStatement':
        for (const s of statement.statements) {
          this.gen(s);
        }
        return;
      case 'ExpressionStatement':
        return this.genExpression(statement.expression);
      case 'VariableDeclarationStatement':

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

  private genExpression(expression: BoundExpression): llvm.Value {
    switch (expression.kind) {
      case 'CallExpression':
        return this.genCallExpression(expression);
      case 'LiteralExpression':
        return this.genLiteralExpression(expression);
      case 'UnaryExpression':
      case 'BinaryExpression':
      case 'VariableExpression':
      case 'AssignmentExpression':
      case 'OperatorAssignmentExpression':
      case 'PostfixUnaryExpression':
      case 'TypeCastExpression':
      case 'ErrorExpression':
        console.warn(
          `\x1b[31mERROR\x1b[0m: Code generation for node type ${expression.kind} not implemented yet.`
        );
        return this.builder.CreateUnreachable();
    }
  }

  genLiteralExpression(expression: LiteralExpression): llvm.Value {
    switch (expression.type.name) {
      case 'int':
        return this.builder.getInt32(Number(expression.value));
      case 'bool':
        return this.builder.getInt1(Boolean(expression.value));
      case 'string':
        /**
       * %str = private unnamed_addr constant [14 x i8] c"Hello, World!\00"
         %cast210 = bitcast [14 x i8]* %str to i8*
       */
        return this.builder.CreateGlobalStringPtr(String(expression.value + '\n'));
    }
    console.warn(
      `\x1b[31mERROR\x1b[0m: Code generation for literal type ${expression.type.name} not implemented yet.`
    );
    return this.builder.CreateUnreachable();
  }

  genCallExpression(expression: CallExpression): llvm.Value {
    switch (expression.functionSymbol.name) {
      case 'print':
        return this.genPrint(expression);
    }
    console.warn(
      `\x1b[31mERROR\x1b[0m: Code generation for function ${expression.functionSymbol.name} not implemented yet.`
    );
    return this.builder.CreateUnreachable();
  }

  genPrint(expression: CallExpression): llvm.Value {
    const printFn = this.module.getFunction('printf')!;
    const args = [this.genExpression(expression.args[0])];
    return this.builder.CreateCall(printFn, args);
  }

  private writeToFile(nasm: string) {
    fs.writeFileSync('build/llvm/out.ll', nasm);
  }

  private compileLlvm() {
    execSync('clang build/llvm/out.ll -o build/llvm/out');
    console.log('Wrote output to build/llvm/out');
  }
}
