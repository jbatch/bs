import { TextSpan } from '../text/TextSpan';
import { ExpressionSyntax } from './Expression';
import { TokenSyntax } from './TokenSyntax';

export type CompilationUnit = {
  kind: 'CompilationUnit';
  expression: ExpressionSyntax;
  eof: TokenSyntax;
  children: SyntaxNode[];
};

export type SyntaxNode = ExpressionSyntax | TokenSyntax | CompilationUnit;

export type SyntaxKind = SyntaxNode['kind'];
