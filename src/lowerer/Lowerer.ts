import assert from 'node:assert';
import { bindBinaryOperator } from '../binding/BoundBinaryOperator';
import {
  BoundAssignmentExpression,
  BoundBinaryExpression,
  BoundExpression,
  BoundLiteralExpression,
  BoundVariableExpression,
  OperatorAssignmentExpression,
  PostfixUnaryExpression,
} from '../binding/BoundExpression';
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
import { Int } from '../symbols/Symbol';

export class Lowerer extends BoundTreeRewriter {
  curLabelIndex = 0;
  lower(root: BoundStatement): BlockStatement {
    const rewritten = this.rewriteBoundStatement(root);
    const flattenedStatements = this.flatten(rewritten);
    return BoundBlockStatement(flattenedStatements);
  }
  flatten(statement: BoundStatement): BoundStatement[] {
    const statements: BoundStatement[] = [];
    const stack: BoundStatement[] = [];

    stack.push(statement);
    while (stack.length > 0) {
      const cur = stack.pop()!;

      if (cur.kind === 'BlockStatement') {
        stack.push(...cur.statements.reverse());
      } else {
        statements.push(cur);
      }
    }
    return statements;
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
     *     continue:
     *     <end>
     *   }
     *  break:
     * }
     */
    const { beginStatement, loopCondition, forBlock, endStatement, continueLabel, breakLabel } =
      statement;
    assert(forBlock.kind === 'BlockStatement');
    const continueLabelStatement = BoundLabelStatement(continueLabel);
    const whileBlock = BoundBlockStatement([
      ...forBlock.statements,
      continueLabelStatement,
      endStatement,
    ]);
    const whileStatement = BoundWhileStatement(
      { name: this.generateLabel() }, // unused
      breakLabel,
      loopCondition,
      whileBlock
    );
    const rewrittenBlock = BoundBlockStatement([beginStatement, whileStatement]);
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
     * continue:
     * while(<condition>) {
     *     <whileBlock>
     * }
     * break:
     * TO
     *
     * continue:
     * conditionalGoTo <condition> <:break> jumpIfTrue=false
     * <whileBlock>
     * goto <continue:>
     * break:
     */
    const { loopCondition, whileBlock, continueLabel, breakLabel } = statement;
    const continueLabelStatement = BoundLabelStatement(continueLabel);
    const breakLabelStatement = BoundLabelStatement(breakLabel);
    const goToBreakIfFalse = BoundConditionalGoToStatement(
      breakLabelStatement.label,
      false,
      loopCondition
    );
    const goToContinue = BoundGoToStatement(continueLabelStatement.label);

    return this.rewriteBoundStatement(
      BoundBlockStatement([
        continueLabelStatement,
        goToBreakIfFalse,
        whileBlock,
        goToContinue,
        breakLabelStatement,
      ])
    );
  }

  rewritePostfixUnaryExpression(expression: PostfixUnaryExpression): BoundExpression {
    /**
     * REWRITE
     * i++
     * TO
     * i = i + 1
     */
    const { type, variable, operator } = expression;
    assert(operator.kind === 'Decrement' || operator.kind === 'Increment');
    const newOperator = bindBinaryOperator(
      operator.kind === 'Increment' ? 'PlusToken' : 'MinusToken',
      type,
      Int
    )!;
    const newVariable = BoundVariableExpression(type, variable);
    const right = BoundBinaryExpression(
      newOperator.type,
      newVariable,
      newOperator,
      BoundLiteralExpression(Int, 1)
    );
    return this.rewriteExpression(BoundAssignmentExpression(type, variable, right));
  }

  rewriteOperatorAssignmentExpression(expression: OperatorAssignmentExpression): BoundExpression {
    /**
     * REWRITE
     * i += <expression>
     * TO
     * i = i + <expression>
     */
    const { type, variable, operator, expression: rightExpression } = expression;
    assert(operator.kind === 'Addition' || operator.kind === 'Subtraction');
    const newOperator = bindBinaryOperator(
      operator.kind === 'Addition' ? 'PlusToken' : 'MinusToken',
      type,
      type
    )!;
    const newVariable = BoundVariableExpression(type, variable);
    const right = BoundBinaryExpression(
      newOperator.type,
      newVariable,
      newOperator,
      rightExpression
    );
    return this.rewriteExpression(BoundAssignmentExpression(type, variable, right));
  }
}
