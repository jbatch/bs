import ts, { TypeNode, factory } from 'typescript';
import fs from 'fs';

const exportKeyword = factory.createToken(ts.SyntaxKind.ExportKeyword);

function array(node: TypeNode): TypeNode {
  return factory.createArrayTypeNode(node);
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

  const propertyAssignment = Object.keys(properties).map((propertyName) => {
    return factory.createShorthandPropertyAssignment(
      factory.createIdentifier(propertyName),
      undefined
    );
  });

  const blockStatement = factory.createBlock(
    [
      // span
      factory.createVariableStatement(
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
      ),
      // children
      factory.createVariableStatement(
        undefined,
        factory.createVariableDeclarationList(
          [
            factory.createVariableDeclaration(
              factory.createIdentifier('children'),
              undefined,
              undefined,
              factory.createArrayLiteralExpression(
                Object.keys(properties).map((identifier) => factory.createIdentifier(identifier)),
                false
              )
            ),
          ],
          ts.NodeFlags.Const
        )
      ),
      factory.createReturnStatement(
        factory.createObjectLiteralExpression(
          [
            factory.createPropertyAssignment(
              factory.createIdentifier('kind'),
              factory.createStringLiteral(name)
            ),
            factory.createShorthandPropertyAssignment(factory.createIdentifier('span'), undefined),
            ...propertyAssignment,
            factory.createShorthandPropertyAssignment(
              factory.createIdentifier('children'),
              undefined
            ),
          ],
          true
        )
      ),
    ],
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
  LiteralExpression: {
    literal: TokenSyntaxTypeNode,
  },
  BinaryExpression: {
    left: ExpressionSyntaxTypeNode,
    operator: TokenSyntaxTypeNode,
    right: ExpressionSyntaxTypeNode,
  },
  UnaryExpression: {
    operator: TokenSyntaxTypeNode,
    operand: ExpressionSyntaxTypeNode,
  },
  ParenthesizedExpression: {
    open: TokenSyntaxTypeNode,
    expression: ExpressionSyntaxTypeNode,
    close: TokenSyntaxTypeNode,
  },
  NameExpression: {
    identifier: TokenSyntaxTypeNode,
  },
  AssignmentExpression: {
    identifier: TokenSyntaxTypeNode,
    equals: TokenSyntaxTypeNode,
    expression: ExpressionSyntaxTypeNode,
  },
};

const typeDeclarations = Object.entries(expressionTypes).map(([name, properties]) =>
  generateExpressionType(name, properties)
);

const unionType = factory.createTypeAliasDeclaration(
  [exportKeyword],
  factory.createIdentifier('ExpressionSyntax'),
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

const filePath = 'src/parsing/ExpressionSyntax.ts';

const header = fs.readFileSync(filePath).toString().split('// Generated code')[0];
fs.writeFileSync(filePath, [`${header}`, '// Generated code\n\n', generatedSource].join(''));

console.log(`Wrote generated source code to ${filePath}`);
