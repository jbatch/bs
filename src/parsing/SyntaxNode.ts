import { ExpressionSyntax } from './ExpressionSyntax';
import { StatementSyntax } from './StatementSyntax';
import { TokenSyntax } from './TokenSyntax';

export type CompilationUnit = {
  kind: 'CompilationUnit';
  statement: StatementSyntax;
  eof: TokenSyntax;
  children: SyntaxNode[];
};

export type SyntaxNode = ExpressionSyntax | TokenSyntax | CompilationUnit | StatementSyntax;

export type SyntaxKind = SyntaxNode['kind'];
