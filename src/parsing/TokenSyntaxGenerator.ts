import {
  BooleanTypeNode,
  Generator,
  GeneratorTypeDefinitions,
  NumberTypeNode,
  StringTypeNode,
  SyntaxNodeTypeNode,
  TextSpanTypeNode,
} from '../codegeneration/Generator';

const statmentTypes: GeneratorTypeDefinitions = {
  // Tokens
  NumberToken: { other: { span: TextSpanTypeNode, value: NumberTypeNode } },
  StringToken: { other: { span: TextSpanTypeNode, value: StringTypeNode } },
  WhitespaceToken: { other: { span: TextSpanTypeNode } },
  PlusToken: { other: { span: TextSpanTypeNode } },
  MinusToken: { other: { span: TextSpanTypeNode } },
  StarToken: { other: { span: TextSpanTypeNode } },
  SlashToken: { other: { span: TextSpanTypeNode } },
  PlusEquals: { other: { span: TextSpanTypeNode } },
  MinusEquals: { other: { span: TextSpanTypeNode } },
  PlusPlus: { other: { span: TextSpanTypeNode } },
  MinusMinus: { other: { span: TextSpanTypeNode } },
  OpenParenthesisToken: { other: { span: TextSpanTypeNode } },
  CloseParenthesisToken: { other: { span: TextSpanTypeNode } },
  OpenBraceToken: { other: { span: TextSpanTypeNode } },
  CloseBraceToken: { other: { span: TextSpanTypeNode } },
  BangToken: { other: { span: TextSpanTypeNode } },
  EqualsToken: { other: { span: TextSpanTypeNode } },
  TildeToken: { other: { span: TextSpanTypeNode } },
  CaretToken: { other: { span: TextSpanTypeNode } },
  AmpersandToken: { other: { span: TextSpanTypeNode } },
  PipeToken: { other: { span: TextSpanTypeNode } },
  ColonToken: { other: { span: TextSpanTypeNode } },
  SemicolonToken: { other: { span: TextSpanTypeNode } },
  CommaToken: { other: { span: TextSpanTypeNode } },
  LessToken: { other: { span: TextSpanTypeNode } },
  GreaterToken: { other: { span: TextSpanTypeNode } },
  LessOrEqualsToken: { other: { span: TextSpanTypeNode } },
  GreaterOrEqualsToken: { other: { span: TextSpanTypeNode } },
  AmpersandAmpersandToken: { other: { span: TextSpanTypeNode } },
  PipePipeToken: { other: { span: TextSpanTypeNode } },
  EqualsEqualsToken: { other: { span: TextSpanTypeNode } },
  BangEqualsToken: { other: { span: TextSpanTypeNode } },
  IdentifierToken: { other: { span: TextSpanTypeNode, text: StringTypeNode } },
  // Literals
  NumberLiteral: { other: { span: TextSpanTypeNode, value: NumberTypeNode } },
  BooleanLiteral: { other: { span: TextSpanTypeNode, value: BooleanTypeNode } },
  StringLiteral: { other: { span: TextSpanTypeNode, value: StringTypeNode } },
  // Keywords
  TrueKeyword: { other: { span: TextSpanTypeNode } },
  FalseKeyword: { other: { span: TextSpanTypeNode } },
  ConstKeyword: { other: { span: TextSpanTypeNode } },
  VarKeyword: { other: { span: TextSpanTypeNode } },
  IfKeyword: { other: { span: TextSpanTypeNode } },
  ElseKeyword: { other: { span: TextSpanTypeNode } },
  WhileKeyword: { other: { span: TextSpanTypeNode } },
  ForKeyword: { other: { span: TextSpanTypeNode } },
  FunctionKeyword: { other: { span: TextSpanTypeNode } },
  ContinueKeyword: { other: { span: TextSpanTypeNode } },
  BreakKeyword: { other: { span: TextSpanTypeNode } },
  BadToken: { other: { span: TextSpanTypeNode } },
  EndOfFileToken: { other: { span: TextSpanTypeNode } },
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
