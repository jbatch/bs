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
  TypeCastExpression,
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
import { Int, String as StringTypeSymbol } from '../symbols/Symbol';

export class Lowerer extends BoundTreeRewriter {
  curLabelIndex = 0;
  lower(root: BoundStatement): BlockStatement {
    const rewritten = this.rewriteBoundStatement(root);
    // const flattenedStatements = this.flatten(rewritten);
    return BoundBlockStatement([rewritten]);
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
     *     goto <continue:>
     * continue:
     *     <end>
     *   }
     *  break:
     * }
     */
    const { beginStatement, loopCondition, forBlock, endStatement, continueLabel, breakLabel } =
      statement;
    assert(forBlock.kind === 'BlockStatement');
    const continueLabelStatement = BoundLabelStatement(continueLabel);
    const gotoContinue = BoundGoToStatement(continueLabel);
    const whileBlock = BoundBlockStatement([
      ...forBlock.statements,
      gotoContinue,
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
     *  conditionGoTo <condition> <ifblock:> else: <end:>
     *  ifblock:
     *    <ifBlock>
     *    goto: <end:>
     *  end:
     * }
     * OR
     * {
     *  conditionalGoTo <condition> <ifblock:> else: <elseblock:>
     *  ifblock:
     *    <ifBlock>
     *    goto <end:>
     *  elseblock:
     *    <elseblock>
     *    goto <end:>
     *  end:
     * }
     */
    const { condition, ifBlock, elseBlock } = statement;
    const ifLabel = BoundLabelStatement({ name: this.generateLabel() });

    if (elseBlock === undefined) {
      const endLabel = BoundLabelStatement({ name: this.generateLabel() });
      const elseLabel = endLabel;
      const goToEndIfFalse = BoundConditionalGoToStatement(
        ifLabel.label,
        elseLabel.label,
        endLabel.label,
        condition
      );
      const goToEnd = BoundGoToStatement(endLabel.label);

      return BoundBlockStatement([goToEndIfFalse, ifLabel, ifBlock, goToEnd, endLabel]);
    }

    const elseLabel = BoundLabelStatement({ name: this.generateLabel() });
    const endLabel = BoundLabelStatement({ name: this.generateLabel() });
    const goToTElseIfFalse = BoundConditionalGoToStatement(
      ifLabel.label,
      elseLabel.label,
      endLabel.label,
      condition
    );
    const goToEnd = BoundGoToStatement(endLabel.label);

    return this.rewriteBoundStatement(
      BoundBlockStatement([
        goToTElseIfFalse,
        ifLabel,
        ifBlock,
        goToEnd,
        elseLabel,
        elseBlock,
        goToEnd,
        endLabel,
      ])
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
     *  goto <continue:>
     * continue:
     *  conditionalGoTo <condition> <:whileblock> else <:break>
     *  whileblock:
     *   <whileBlock>
     *   goto <continue:>
     * break:
     */
    const { loopCondition, whileBlock, continueLabel, breakLabel } = statement;
    const continueLabelStatement = BoundLabelStatement(continueLabel);
    const whileLabelStatement = BoundLabelStatement({ name: this.generateLabel() });
    const breakLabelStatement = BoundLabelStatement(breakLabel);
    const goToBreakIfFalse = BoundConditionalGoToStatement(
      whileLabelStatement.label,
      breakLabelStatement.label,
      breakLabelStatement.label,
      loopCondition
    );
    const goToContinue = BoundGoToStatement(continueLabelStatement.label);

    return this.rewriteBoundStatement(
      BoundBlockStatement([
        goToContinue,
        continueLabelStatement,
        goToBreakIfFalse,
        whileLabelStatement,
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

  /**
   * REWRITE
   * string(1)
   * TO
   * "1"
   */
  protected rewriteTypeCastExpression(expression: TypeCastExpression): BoundExpression {
    if (expression.type.name === 'string' && expression.expression.kind === 'LiteralExpression') {
      return BoundLiteralExpression(StringTypeSymbol, String(expression.expression.value));
    }
    return expression;
  }
}
