import { execSync } from 'node:child_process';
import { BlockStatement } from '../binding/BoundStatement';
import { SymbolTable } from '../binding/SymbolTable';
import { FunctionSymbol } from '../symbols/Symbol';
import fs from 'node:fs';
import llvm from 'llvm-bindings';

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
    const llvm = this.buildLlvm();
    this.writeToFile(llvm);
    this.compileLlvm();
  }

  buildLlvm() {
    const functionType = llvm.FunctionType.get(this.builder.getInt32Ty(), [], false);
    this.createFunction('main', functionType);
    const result = this.gen();

    const i32Result = this.builder.CreateIntCast(result, this.builder.getInt32Ty(), true);
    this.builder.CreateRet(i32Result);

    return this.module.print();
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

  private gen(): llvm.Value {
    return this.builder.getInt32(42);
  }

  private writeToFile(nasm: string) {
    fs.writeFileSync('build/llvm/out.ll', nasm);
  }

  private compileLlvm() {
    execSync('clang build/llvm/out.ll -o build/llvm/out');
    console.log('Wrote output to build/llvm/out');
  }
}
