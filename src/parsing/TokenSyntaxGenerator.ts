import {
  BooleanTypeNode,
  Generator,
  NumberTypeNode,
  StringTypeNode,
  SyntaxNodeTypeNode,
  TextSpanTypeNode,
  TypeNodeMap,
} from '../codegeneration/Generator';

const statmentTypes: Record<string, TypeNodeMap> = {
  // Tokens
  NumberToken: { span: TextSpanTypeNode, value: NumberTypeNode },
  WhitespaceToken: { span: TextSpanTypeNode },
  PlusToken: { span: TextSpanTypeNode },
  MinusToken: { span: TextSpanTypeNode },
  StarToken: { span: TextSpanTypeNode },
  SlashToken: { span: TextSpanTypeNode },
  OpenParenthesisToken: { span: TextSpanTypeNode },
  CloseParenthesisToken: { span: TextSpanTypeNode },
  OpenBraceToken: { span: TextSpanTypeNode },
  CloseBraceToken: { span: TextSpanTypeNode },
  BangToken: { span: TextSpanTypeNode },
  EqualsToken: { span: TextSpanTypeNode },
  TildeToken: { span: TextSpanTypeNode },
  CaretToken: { span: TextSpanTypeNode },
  AmpersandToken: { span: TextSpanTypeNode },
  PipeToken: { span: TextSpanTypeNode },
  SemicolonToken: { span: TextSpanTypeNode },
  LessToken: { span: TextSpanTypeNode },
  GreaterToken: { span: TextSpanTypeNode },
  LessOrEqualsToken: { span: TextSpanTypeNode },
  GreaterOrEqualsToken: { span: TextSpanTypeNode },
  AmpersandAmpersandToken: { span: TextSpanTypeNode },
  PipePipeToken: { span: TextSpanTypeNode },
  EqualsEqualsToken: { span: TextSpanTypeNode },
  BangEqualsToken: { span: TextSpanTypeNode },
  IdentifierToken: { span: TextSpanTypeNode, text: StringTypeNode },
  // Literals
  NumberLiteral: { span: TextSpanTypeNode, value: NumberTypeNode },
  BooleanLiteral: { span: TextSpanTypeNode, value: BooleanTypeNode },
  // Keywords
  TrueKeyword: { span: TextSpanTypeNode },
  FalseKeyword: { span: TextSpanTypeNode },
  ConstKeyword: { span: TextSpanTypeNode },
  VarKeyword: { span: TextSpanTypeNode },
  IfKeyword: { span: TextSpanTypeNode },
  ElseKeyword: { span: TextSpanTypeNode },
  WhileKeyword: { span: TextSpanTypeNode },
  ForKeyword: { span: TextSpanTypeNode },
  BadToken: { span: TextSpanTypeNode },
  EndOfFileToken: { span: TextSpanTypeNode },
};

const generator = new Generator(
  'TokenSyntax',
  'src/parsing/TokenSyntax.ts',
  SyntaxNodeTypeNode,
  statmentTypes,
  {
    typeSuffix: 'Syntax',
    hasChildren: true,
    emptyChildren: true,
  }
);

generator.run();
