import { BoundExpression } from '../binding/BoundExpression';
import { BlockStatement, BoundStatement } from '../binding/BoundStatement';
import { getTokenTextForKind } from '../parsing/SyntaxHelper';
import { VariableSymbol } from '../symbols/Symbol';

function red(msg: string): string {
  return `\x1b[31m${msg}\x1b[0m`;
}

function green(msg: string): string {
  return `\x1b[32m${msg}\x1b[0m`;
}

function yellow(msg: string): string {
  return `\x1b[33m${msg}\x1b[0m`;
}

function blue(msg: string): string {
  return `\x1b[34m${msg}\x1b[0m`;
}

function magenta(msg: string): string {
  return `\x1b[35m${msg}\x1b[0m`;
}

function cyan(msg: string): string {
  return `\x1b[36m${msg}\x1b[0m`;
}

function white(msg: string): string {
  return `\x1b[37m${msg}\x1b[0m`;
}

function gray(msg: string): string {
  return `\x1b[90m${msg}\x1b[0m`;
}

export class BoundNodePrinter {
  statementBlock: BlockStatement;
  onNewLine = true;
  indent: number = 1;
  inline: boolean = false;
  constructor(statementBlock: BlockStatement) {
    this.statementBlock = statementBlock;
  }

  print() {
    for (const statement of this.statementBlock.statements) {
      this.printStatement(statement);
    }
  }

  log(msg: string) {
    const indentSpacing = this.onNewLine ? '   '.repeat(this.indent) : '';
    process.stdout.write(`${indentSpacing}${msg}`);
    this.onNewLine = false;
  }

  newLine() {
    if (!this.inline) {
      this.log('\n');
      this.onNewLine = true;
    }
  }

  printStatement(statement: BoundStatement) {
    switch (statement.kind) {
      case 'ExpressionStatement':
        this.printExpression(statement.expression);
        this.newLine();
        break;
      case 'BlockStatement':
        this.printPunctuation('{');
        this.newLine();
        this.indent++;
        for (const s of statement.statements) {
          this.printStatement(s);
        }
        this.indent--;
        this.newLine();
        this.printPunctuation('}');
        this.newLine();
        break;
      case 'VariableDeclarationStatement':
        this.printVariable(statement.variable);
        this.printPunctuation(' = ');
        this.printExpression(statement.expression);
        this.newLine();
        break;
      case 'IfStatement':
        this.printKeyword('if');
        this.printPunctuation(' (');
        this.printExpression(statement.condition);
        this.printPunctuation(') {');
        this.newLine();
        this.indent++;
        for (const s of statement.ifBlock.statements) {
          this.printStatement(s);
        }
        this.indent--;
        this.printPunctuation('}');
        if (statement.elseBlock) {
          this.log(' ');
          this.printKeyword('else');
          this.printPunctuation(' {');
          this.newLine();
          this.indent++;
          for (const s of statement.elseBlock.statements) {
            this.printStatement(s);
          }
          this.indent--;
          this.printPunctuation('}');
        }
        this.newLine();
        break;
      case 'WhileStatement':
        this.printKeyword('while');
        this.printPunctuation('(');
        this.printExpression(statement.loopCondition);
        this.printPunctuation(') {');
        this.newLine();
        this.indent++;
        for (const s of statement.whileBlock.statements) {
          this.printStatement(s);
        }
        this.indent--;
        this.printPunctuation('}');
        this.newLine();
        break;
      case 'ForStatement':
        this.printKeyword('for');
        this.printPunctuation('(');
        this.inline = true;
        this.printStatement(statement.beginStatement);
        this.printPunctuation('; ');
        this.printExpression(statement.loopCondition);
        this.printPunctuation('; ');
        this.printStatement(statement.endStatement);
        this.inline = false;
        this.printPunctuation(') {');
        this.newLine();
        this.indent++;
        for (const s of statement.forBlock.statements) {
          this.printStatement(s);
        }
        this.indent--;
        this.printPunctuation('}');
        this.newLine();
        break;
      case 'FunctionDeclarationStatement':
        this.log(statement.kind);
        break;
      case 'LabelStatement':
        const currIndent = this.indent;
        this.indent = 0;
        this.printLabel(statement.label.name);
        this.printPunctuation(':');
        this.indent = currIndent;
        this.newLine();
        break;
      case 'GoToStatement':
        this.printKeyword('goto ');
        this.printLabel(statement.label.name);
        this.newLine();
        break;
      case 'ConditionalGoToStatement':
        this.printKeyword('goto ');
        this.printLabel(statement.label.name);
        this.printKeyword(statement.jumpIfTrue ? ' if ' : ' unless ');
        this.printExpression(statement.condition);
        this.newLine();
        break;
    }
  }

  printExpression(expression: BoundExpression) {
    switch (expression.kind) {
      case 'UnaryExpression':
        this.printPunctuation(getTokenTextForKind(expression.operator.syntaxKind));
        this.printExpression(expression.operand);
        break;
      case 'BinaryExpression':
        this.printExpression(expression.left);
        this.printPunctuation(` ${getTokenTextForKind(expression.operator.syntaxKind)} `);
        this.printExpression(expression.right);
        break;
      case 'LiteralExpression':
        const t = expression.type.name;
        if (t === 'string') {
          this.log(magenta(`'${String(expression.value)}'`));
        } else if (t === 'int') {
          this.log(cyan(String(expression.value)));
        } else if (t === 'bool') {
          this.log(blue(String(expression.value)));
        } else {
          this.log(red(String(expression.value)));
        }
        break;
      case 'VariableExpression':
        this.printVariable(expression.variable);
        break;
      case 'AssignmentExpression':
        this.printVariable(expression.variable);
        this.printPunctuation(' = ');
        this.printExpression(expression.expression);
        break;
      case 'OperatorAssignmentExpression':
        this.printVariable(expression.variable);
        this.printPunctuation(` ${getTokenTextForKind(expression.operator.syntaxKind)} `);
        this.printExpression(expression.expression);
        break;
      case 'PostfixUnaryExpression':
        this.printVariable(expression.variable);
        this.printPunctuation(getTokenTextForKind(expression.operator.syntaxKind));
        break;
      case 'CallExpression':
        this.printFunction(expression.functionSymbol.name);
        this.printPunctuation('(');
        expression.args.forEach((arg, idx) => {
          this.printExpression(arg);
          if (idx < expression.args.length - 1) {
            this.printPunctuation(', ');
          }
        });
        this.printPunctuation(')');
        break;
      case 'TypeCastExpression':
        this.printFunction(expression.type.name);
        this.printPunctuation('(');
        this.printExpression(expression.expression);
        this.printPunctuation(')');
        break;
      case 'ErrorExpression':
        this.log(red(expression.kind));
        break;
    }
  }

  printVariable(variable: VariableSymbol) {
    this.log(yellow(variable.name));
  }

  printFunction(func: string) {
    this.log(yellow(func));
  }

  printKeyword(keyword: string) {
    this.log(blue(keyword));
  }

  printPunctuation(keyword: string) {
    this.log(gray(keyword));
  }

  printLabel(label: string) {
    this.log(green(label));
  }
}
