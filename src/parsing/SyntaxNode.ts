import { ExpressionSyntax } from './ExpressionSyntax';
import { StatementSyntax } from './StatementSyntax';
import { TokenSyntax } from './TokenSyntax';

export type CompilationUnit = {
  kind: 'CompilationUnit';
  statement: StatementSyntax;
  eof: TokenSyntax;
  children: SyntaxNode[];
};

// TODO find somewhere nicer to put else clause
export type SyntaxNode = ExpressionSyntax | TokenSyntax | CompilationUnit | StatementSyntax;

export type SyntaxKind = SyntaxNode['kind'];

export function prettyPrint(node: SyntaxNode, indent: string = '', isLast: boolean = true) {
  const marker = isLast ? '└──' : '├──';
  process.stdout.write(indent);
  process.stdout.write(marker);
  process.stdout.write(node.kind);
  if (node.kind === 'LiteralExpression' && node.literal.value) {
    process.stdout.write(' (' + node.literal.value.toString() + ')');
  }
  if (node.kind === 'IdentifierToken' && node.text) {
    process.stdout.write(' (' + node.text + ')');
  }
  console.log();
  indent += isLast ? '   ' : '│  ';
  for (let i = 0; i < node.children.length; i++) {
    prettyPrint(node.children[i], indent, i === node.children.length - 1);
  }
}
