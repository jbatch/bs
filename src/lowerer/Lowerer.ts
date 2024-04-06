import assert from 'node:assert';
import {
  BlockStatement,
  BoundBlockStatement,
  BoundStatement,
  BoundWhileStatement,
  ForStatement,
} from '../binding/BoundStatement';
import { BoundTreeRewriter } from '../binding/BoundTreeRewriter';

export class Lowerer extends BoundTreeRewriter {
  lower(root: BoundStatement): BlockStatement {
    const rewritten = this.rewriteBoundStatement(root);
    const flattenedStatments = this.flatten(rewritten);
    return BoundBlockStatement(flattenedStatments);
  }
  flatten(statement: BoundStatement): BoundStatement[] {
    const statments: BoundStatement[] = [];
    const stack: BoundStatement[] = [];

    stack.push(statement);
    while (stack.length > 0) {
      const cur = stack.pop()!;

      if (cur.kind === 'BlockStatement') {
        stack.push(...cur.statements.reverse());
      } else {
        statments.push(cur);
      }
    }
    return statments;
  }
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
