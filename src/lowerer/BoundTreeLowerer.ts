import {
  BlockStatement,
  BoundStatement,
  ExpressionStatement,
  VariableDelcarationStatement,
  IfStatement,
  WhileStatement,
  ForStatement,
} from '../binding/BoundStatement';

export class BoundTreeLowerer {
  public rewriteBoundTree(boundTreeRoot: BoundStatement): BoundStatement {
    switch (boundTreeRoot.kind) {
      case 'ExpressionStatement':
        return this.rewriteExpressionStatement(boundTreeRoot);
      case 'BlockStatement':
        return this.rewriteBlockStatement(boundTreeRoot);
      case 'VariableDelcarationStatement':
        return this.rewriteVariableDelcarationStatement(boundTreeRoot);
      case 'IfStatement':
        return this.rewriteIfStatement(boundTreeRoot);
      case 'WhileStatement':
        return this.rewriteWhileStatement(boundTreeRoot);
      case 'ForStatement':
        return this.rewriteForStatement(boundTreeRoot);
    }
  }

  private rewriteExpressionStatement(statement: ExpressionStatement): BoundStatement {
    return statement;
  }

  private rewriteBlockStatement(statement: BlockStatement): BoundStatement {
    return statement;
  }

  private rewriteVariableDelcarationStatement(
    statement: VariableDelcarationStatement
  ): BoundStatement {
    return statement;
  }

  private rewriteIfStatement(statement: IfStatement): BoundStatement {
    return statement;
  }

  private rewriteWhileStatement(statement: WhileStatement): BoundStatement {
    return statement;
  }

  private rewriteForStatement(statement: ForStatement): BoundStatement {
    return statement;
  }
}
