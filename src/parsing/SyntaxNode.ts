import { ExpressionSyntax } from './Expression';
import { TokenSyntax } from './TokenSyntax';

export type SyntaxNode = ExpressionSyntax | TokenSyntax;

export type SyntaxKind = SyntaxNode['kind'];
