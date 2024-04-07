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
  WhileStatement,
} from '../binding/BoundStatement';
import { BoundTreeRewriter } from '../binding/BoundTreeRewriter';
import {
  PostfixUnaryExpression,
  BoundExpression,
  BoundVariableExpression,
  BoundLiteralExpression,
  BoundAssignmentExpression,
  OperatorAssignmentExpression,
  BoundBinaryExpression,
} from '../binding/BoundExpression';
import { bindBinaryOperator } from '../binding/BoundBinaryOperator';
import { Int } from '../symbols/Symbol';

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
    /**
     * REWRITE
     * for(<begin>; <condition>; <end>) {
     *  <forBlock>
     * }
     * TO
     * {
     *   <begin>
     *   while( <condition> ) {
     *     <forBlock>
     *     <end>
     *   }
     * }
     */
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

    return this.rewriteBoundStatement(
      BoundBlockStatement([goToTElseIfFalse, ifBlock, goToEnd, elseLabel, elseBlock, endLabel])
    );
  }

  rewriteWhileStatement(statement: WhileStatement): BoundStatement {
    /**
     * REWRITE
     * while(<condition>) {
     *     <whileBlock>
     * }
     * TO
     *
     * begin:
     * conditionalGoTo <condition> <:end> jumpIfTrue=false
     * <whileBlock>
     * goto <begin:>
     * end:
     */
    const { loopCondition, whileBlock } = statement;
    const beginLabel = BoundLabelStatement({ name: this.generateLabel() });
    const endLabel = BoundLabelStatement({ name: this.generateLabel() });
    const goToEndIfFalse = BoundConditionalGoToStatement(endLabel.label, false, loopCondition);
    const goToBegin = BoundGoToStatement(beginLabel.label);

    return this.rewriteBoundStatement(
      BoundBlockStatement([beginLabel, goToEndIfFalse, whileBlock, goToBegin, endLabel])
    );
  }

  rewritePostfixUnaryExpression(expression: PostfixUnaryExpression): BoundExpression {
    /**
     * REWRITE
     * i++
     * TO
     * i = i + 1
     */
    const { type, name, operator } = expression;
    assert(operator.kind === 'Decrement' || operator.kind === 'Increment');
    const newOperator = bindBinaryOperator(
      operator.kind === 'Increment' ? 'PlusToken' : 'MinusToken',
      type,
      Int
    )!;
    const variable = BoundVariableExpression(type, name);
    const right = BoundBinaryExpression(
      newOperator.type,
      variable,
      newOperator,
      BoundLiteralExpression(Int, 1)
    );
    return this.rewriteExpression(BoundAssignmentExpression(type, name, right));
  }

  rewriteOperatorAssignmentExpression(expression: OperatorAssignmentExpression): BoundExpression {
    /**
     * REWRITE
     * i += <expression>
     * TO
     * i = i + <expression>
     */
    const { type, name, operator, expression: rightExpression } = expression;
    assert(operator.kind === 'Addition' || operator.kind === 'Subtraction');
    const newOperator = bindBinaryOperator(
      operator.kind === 'Addition' ? 'PlusToken' : 'MinusToken',
      type,
      Int
    )!;
    const variable = BoundVariableExpression(type, name);
    const right = BoundBinaryExpression(newOperator.type, variable, newOperator, rightExpression);
    return this.rewriteExpression(BoundAssignmentExpression(type, name, right));
  }
}
