import ts, { ArrayLiteralExpression, Expression, TypeNode, factory } from 'typescript';
import fs from 'fs';

const exportKeyword = factory.createToken(ts.SyntaxKind.ExportKeyword);

function array(node: TypeNode): TypeNode {
  return factory.createArrayTypeNode(node);
}

function optional(node: TypeNode): TypeNode {
  return factory.createUnionTypeNode([
    node,
    factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword),
  ]);
}

function createSpanDeclarationStatement(properties: Record<string, TypeNode>) {
  return factory.createVariableStatement(
    undefined,
    factory.createVariableDeclarationList(
      [
        factory.createVariableDeclaration(
          factory.createIdentifier('span'),
          undefined,
          undefined,
          factory.createPropertyAccessExpression(
            factory.createIdentifier(Object.keys(properties)[0]),
            factory.createIdentifier('span')
          )
        ),
      ],
      ts.NodeFlags.Const
    )
  );
}

function createChildrenDeclarationStatment(properties: Record<string, TypeNode>) {
  const hasOptionalTypes = Object.values(properties).some(ts.isUnionTypeNode);

  let expressions: Expression = factory.createArrayLiteralExpression(
    Object.entries(properties).map(([identifier, property]) =>
      ts.isArrayTypeNode(property)
        ? factory.createSpreadElement(factory.createIdentifier(identifier))
        : factory.createIdentifier(identifier)
    ),
    true
  );

  if (hasOptionalTypes) {
    expressions = filterDefined(expressions);
  }

  return factory.createVariableStatement(
    undefined,
    factory.createVariableDeclarationList(
      [
        factory.createVariableDeclaration(
          factory.createIdentifier('children'),
          undefined,
          undefined,
          expressions
        ),
      ],
      ts.NodeFlags.Const
    )
  );
}

function createPropertyAssignments(properties: Record<string, TypeNode>) {
  return Object.keys(properties).map((propertyName) => {
    return factory.createShorthandPropertyAssignment(
      factory.createIdentifier(propertyName),
      undefined
    );
  });
}

// TypeNodes
const TokenSyntaxTypeNode = factory.createTypeReferenceNode(
  factory.createIdentifier('TokenSyntax'),
  undefined
);
const ExpressionSyntaxTypeNode = factory.createTypeReferenceNode(
  factory.createIdentifier('ExpressionSyntax'),
  undefined
);
const TextSpanTypeNode = factory.createTypeReferenceNode(
  factory.createIdentifier('TextSpan'),
  undefined
);
const SyntaxNodeTypeNode = factory.createTypeReferenceNode(
  factory.createIdentifier('SyntaxNode'),
  undefined
);
const StatementSyntaxTypeNode = factory.createTypeReferenceNode(
  factory.createIdentifier('StatementSyntax'),
  undefined
);

function filterDefined(expressions: Expression) {
  return factory.createCallExpression(
    factory.createPropertyAccessExpression(expressions, factory.createIdentifier('filter')),
    undefined,
    [factory.createIdentifier('isDefined')]
  );
}

function generateExpressionType(name: string, properties: Record<string, TypeNode>) {
  const otherProperties = Object.entries(properties).map(([propertyName, propertyType]) =>
    factory.createPropertySignature(
      undefined,
      factory.createIdentifier(propertyName),
      undefined,
      propertyType
    )
  );

  const literalNode = factory.createTypeLiteralNode([
    factory.createPropertySignature(
      undefined,
      factory.createIdentifier('kind'),
      undefined,
      factory.createLiteralTypeNode(factory.createStringLiteral(name))
    ),
    factory.createPropertySignature(
      undefined,
      factory.createIdentifier('span'),
      undefined,
      TextSpanTypeNode
    ),
    ...otherProperties,
    factory.createPropertySignature(
      undefined,
      factory.createIdentifier('children'),
      undefined,
      array(SyntaxNodeTypeNode)
    ),
  ]);

  return factory.createTypeAliasDeclaration(
    [exportKeyword],
    factory.createIdentifier(`${name}Syntax`),
    undefined,
    literalNode
  );
}

function generateConstructor(name: string, properties: Record<string, TypeNode>) {
  function constructorName() {
    return `${name}`;
  }

  const parameters = Object.entries(properties).map(([propertyName, propertyType]) => {
    return factory.createParameterDeclaration(
      undefined,
      undefined,
      factory.createIdentifier(propertyName),
      undefined,
      propertyType,
      undefined
    );
  });

  const spanDeclareation = createSpanDeclarationStatement(properties);
  const childrenDeclaration = createChildrenDeclarationStatment(properties);
  const propertyAssignments = createPropertyAssignments(properties);

  const returnNode = factory.createReturnStatement(
    factory.createObjectLiteralExpression(
      [
        factory.createPropertyAssignment(
          factory.createIdentifier('kind'),
          factory.createStringLiteral(name)
        ),
        factory.createShorthandPropertyAssignment(factory.createIdentifier('span'), undefined),
        ...propertyAssignments,
        factory.createShorthandPropertyAssignment(factory.createIdentifier('children'), undefined),
      ],
      true
    )
  );

  const blockStatement = factory.createBlock(
    [spanDeclareation, childrenDeclaration, returnNode],
    true
  );

  return factory.createFunctionDeclaration(
    [factory.createToken(ts.SyntaxKind.ExportKeyword)],
    undefined,
    factory.createIdentifier(constructorName()),
    undefined,
    [...parameters],
    // Return type
    factory.createTypeReferenceNode(factory.createIdentifier(`${name}Syntax`), undefined),
    blockStatement
  );
}

const expressionTypes: Record<string, Record<string, TypeNode>> = {
  ExpressionStatement: {
    expression: ExpressionSyntaxTypeNode,
  },
  BlockStatement: {
    open: TokenSyntaxTypeNode,
    statements: array(StatementSyntaxTypeNode),
    close: TokenSyntaxTypeNode,
  },
  VariableDeclarationStatement: {
    keyword: TokenSyntaxTypeNode,
    identifier: TokenSyntaxTypeNode,
    equals: TokenSyntaxTypeNode,
    expression: ExpressionSyntaxTypeNode,
  },
  IfStatement: {
    ifKeyword: TokenSyntaxTypeNode,
    openParenthesis: TokenSyntaxTypeNode,
    condition: ExpressionSyntaxTypeNode,
    closeParenthesis: TokenSyntaxTypeNode,
    ifBlock: StatementSyntaxTypeNode,
    elseKeyword: optional(TokenSyntaxTypeNode),
    elseBlock: optional(StatementSyntaxTypeNode),
  },
  WhileStatement: {
    whileKeyword: TokenSyntaxTypeNode,
    openParenthesis: TokenSyntaxTypeNode,
    loopCondition: ExpressionSyntaxTypeNode,
    closeParenthesis: TokenSyntaxTypeNode,
    whileBlock: StatementSyntaxTypeNode,
  },
  ForStatement: {
    forKeyword: TokenSyntaxTypeNode,
    openParenthesis: TokenSyntaxTypeNode,
    beginStatement: StatementSyntaxTypeNode,
    loopCondition: ExpressionSyntaxTypeNode,
    endStatement: StatementSyntaxTypeNode,
    closeParenthesis: TokenSyntaxTypeNode,
    forBlock: StatementSyntaxTypeNode,
  },
};

const typeDeclarations = Object.entries(expressionTypes).map(([name, properties]) =>
  generateExpressionType(name, properties)
);

const unionType = factory.createTypeAliasDeclaration(
  [exportKeyword],
  factory.createIdentifier('StatementSyntax'),
  undefined,
  factory.createUnionTypeNode([
    ...Object.values(typeDeclarations).map((t) => factory.createTypeReferenceNode(t.name)),
  ])
);

const constructors = Object.entries(expressionTypes).map(([name, properties]) =>
  generateConstructor(name, properties)
);

function generateSourceCode(nodes: any) {
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  const resultFile = ts.createSourceFile(
    'temp.ts',
    '',
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TSX
  );

  return printer.printList(ts.ListFormat.MultiLine, nodes, resultFile);
}

const generatedSource = generateSourceCode([...typeDeclarations, unionType, ...constructors]);

const filePath = 'src/parsing/StatementSyntax.ts';

const header = fs.readFileSync(filePath).toString().split('// Generated code')[0];
fs.writeFileSync(filePath, [`${header}`, '// Generated code\n\n', generatedSource].join(''));

console.log(`Wrote generated source code to ${filePath}`);
