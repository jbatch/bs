import { Binder } from '../binding/Binder';
import { BoundScope } from '../binding/BoundScope';
import { BoundBlockStatement } from '../binding/BoundStatement';
import { Lowerer } from '../lowerer/Lowerer';
import { Parser } from '../parsing/Parser';
import { FunctionDeclarationSyntax } from '../parsing/StatementSyntax';
import { prettyPrintTree } from '../parsing/SyntaxNode';
import { BoundNodePrinter } from '../repl/BoundNodePrinter';
import { DiagnosticBag } from '../reporting/Diagnostic';

type CompilerOptions = { showTree: boolean; showProgram: boolean; printLoweredTree: boolean };

export class Compiler {
  globalScope: BoundScope;
  constructor(globalScope?: BoundScope) {
    this.globalScope = globalScope ?? BoundScope.createRootScope();
  }

  compile(inputText: string, options: CompilerOptions) {
    // Lex and Parse text
    const parser = new Parser(inputText);
    const sourceText = parser.source;
    const compilationUnit = parser.parse();

    // Bind statements
    const binder = new Binder(this.globalScope);
    const globalStatements = compilationUnit.statements.filter(
      (s) => s.kind !== 'FunctionDeclaration'
    );
    const functionDeclarations = compilationUnit.statements.filter(
      (s): s is FunctionDeclarationSyntax => s.kind === 'FunctionDeclaration'
    );
    // Bind function definitions first
    binder.bindFunctionDeclarations(functionDeclarations);
    // Bind global statements
    const boundGlobalStatements = binder.bindGlobalStatements(globalStatements);
    const blockStatement = BoundBlockStatement(boundGlobalStatements);
    const functionTable = binder.bindFunctionBodies(
      binder.scope.getDeclaredFunctions().filter((f) => f.declaration)
    );
    const updatedGlobalScope = binder.scope;

    // Show errors
    const diagnostics = new DiagnosticBag();
    diagnostics.addBag(parser.diagnostics);
    diagnostics.addBag(binder.diagnostics);

    // Print AST
    if (options.showTree) {
      prettyPrintTree(compilationUnit.statements[0]);
    }

    // Rewrite tree
    const loweredBlockStatement = new Lowerer().lower(blockStatement);

    // Print bound tree
    if (options.showProgram) {
      new BoundNodePrinter(
        options.printLoweredTree ? loweredBlockStatement : blockStatement
      ).print();
      for (const [fn, body] of Object.entries(functionTable.symbolTable)) {
        console.log(fn + '()');
        new BoundNodePrinter(body!).print();
      }
    }

    return {
      diagnostics,
      blockStatement: loweredBlockStatement,
      updatedGlobalScope,
      functionTable,
      sourceText,
    };
  }
}
