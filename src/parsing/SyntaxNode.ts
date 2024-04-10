import { ContainerNode } from './ContainerNode';
import { ExpressionSyntax } from './ExpressionSyntax';
import {
  BlockStatementSyntax,
  FunctionDeclarationSyntax,
  StatementSyntax,
} from './StatementSyntax';
import { TokenSyntax } from './TokenSyntax';

// TODO find somewhere nicer to put else clause
export type MemberNode = BlockStatementSyntax | FunctionDeclarationSyntax;
export type SyntaxNode = ExpressionSyntax | TokenSyntax | ContainerNode | StatementSyntax;

export type SyntaxKind = SyntaxNode['kind'];

export function prettyPrintTree(node: SyntaxNode, indent: string = '', isLast: boolean = true) {
  const marker = isLast ? '└──' : '├──';
  process.stdout.write(indent);
  process.stdout.write(marker);
  process.stdout.write(node.kind);
  if (node.kind === 'LiteralExpression' && node.literal) {
    process.stdout.write(' (' + node.literal.toString() + ')');
  }
  if (node.kind === 'IdentifierToken' && node.text) {
    process.stdout.write(' (' + node.text + ')');
  }
  console.log();
  indent += isLast ? '   ' : '│  ';
  for (let i = 0; i < node.children.length; i++) {
    prettyPrintTree(node.children[i], indent, i === node.children.length - 1);
  }
}
