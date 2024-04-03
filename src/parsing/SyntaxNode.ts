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
