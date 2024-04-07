import { VariableSymbol } from '../symbols/Symbol';
import { BoundBinaryOperator } from './BoundBinaryOperator';
import { BoundExpression } from './BoundExpression';
import { BoundStatement } from './BoundStatement';
import { BoundUnaryOperator } from './BoundUnaryOperator';

export type BoundNode =
  | BoundStatement
  | BoundExpression
  | BoundBinaryOperator
  | BoundUnaryOperator
  | VariableSymbol;

export function prettyPrintProgram(node: BoundNode, indent: string = '', isLast: boolean = true) {
  const marker = isLast ? '└──' : '├──';
  process.stdout.write(indent);
  process.stdout.write(marker);
  process.stdout.write(node.kind);
  if (node.kind === 'LiteralExpression') {
    process.stdout.write(' (' + node.value.toString() + ')');
  }
  if (node.kind === 'Variable') {
    process.stdout.write(' (' + node.name + ')');
  }
  if (node.kind === 'VariableExpression') {
    process.stdout.write(' (' + node.name + ')');
  }
  if (node.kind === 'LabelStatement') {
    process.stdout.write(' (' + node.label.name + ')');
  }
  if (node.kind === 'GoToStatement') {
    process.stdout.write(`(label=${node.label.name})`);
  }
  if (node.kind === 'ConditionalGoToStatement') {
    process.stdout.write(`(label=${node.label.name}, jumpIfTrue=${node.jumpIfTrue})`);
  }
  console.log();
  indent += isLast ? '   ' : '│  ';
  if (node.kind !== 'Variable') {
    for (let i = 0; i < node.children.length; i++) {
      prettyPrintProgram(node.children[i], indent, i === node.children.length - 1);
    }
  }
}
