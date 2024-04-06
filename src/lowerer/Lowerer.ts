import assert from 'node:assert';
import {
  BoundBlockStatement,
  BoundStatement,
  BoundWhileStatement,
  ForStatement,
} from '../binding/BoundStatement';
import { BoundTreeRewriter } from '../binding/BoundTreeRewriter';

export class Lowerer extends BoundTreeRewriter {
  rewriteForStatement(statement: ForStatement): BoundStatement {
    const { beginStatement, loopCondition, forBlock, endStatement } = statement;
    assert(forBlock.kind === 'BlockStatement');
    const whileStatment = BoundWhileStatement(
      loopCondition,
      BoundBlockStatement([...forBlock.statements, endStatement])
    );
    const rewrittenBlock = BoundBlockStatement([beginStatement, whileStatment]);
    return this.rewriteBoundStatement(rewrittenBlock);
  }
}
