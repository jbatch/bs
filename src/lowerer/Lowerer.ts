import assert from 'node:assert';
import {
  BlockStatement,
  BoundBlockStatement,
  BoundConditionalGoToStatement,
  BoundGoToStatement,
  BoundLabelStatement,
  BoundStatement,
  BoundWhileStatement,
  ForStatement,
  IfStatement,
} from '../binding/BoundStatement';
import { BoundTreeRewriter } from '../binding/BoundTreeRewriter';

export class Lowerer extends BoundTreeRewriter {
  curLabelIndex = 0;
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

  generateLabel(): string {
    this.curLabelIndex++;
    return `label${this.curLabelIndex}`;
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

  rewriteIfStatement(statement: IfStatement): BoundStatement {
    /**
     * REWRITE
     * if (<condition>) {
     *    <ifBlock>
     * } else {
     *   <elseBlock>
     * }
     *
     * TO
     *
     * {
     *  conditionGoTo <condition> <end:> jumpIfTrue=false
     *  <ifBlock>
     *  end:
     * }
     * OR
     * {
     *  conditionalGoTo <condition> <else:> jumpIfTrue=false
     *  <ifBlock>
     *  goto <end:>
     *  else:
     *  <elseblock>
     *  end:
     * }
     */
    const { condition, ifBlock, elseBlock } = statement;

    if (elseBlock === undefined) {
      const endLabel = BoundLabelStatement({ name: this.generateLabel() });
      const goToEndIfFalse = BoundConditionalGoToStatement(endLabel.label, false, condition);

      return BoundBlockStatement([goToEndIfFalse, ifBlock, endLabel]);
    }

    const elseLabel = BoundLabelStatement({ name: this.generateLabel() });
    const endLabel = BoundLabelStatement({ name: this.generateLabel() });
    const goToTElseIfFalse = BoundConditionalGoToStatement(elseLabel.label, false, condition);
    const goToEnd = BoundGoToStatement(endLabel.label);

    return BoundBlockStatement([
      goToTElseIfFalse,
      ifBlock,
      goToEnd,
      elseLabel,
      elseBlock,
      endLabel,
    ]);
  }
}
