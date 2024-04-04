import ts, { TypeNode, factory } from 'typescript';
import fs from 'fs';

const exportKeyword = factory.createToken(ts.SyntaxKind.ExportKeyword);

// TypeNodes
const StringTypeNode = factory.createTypeReferenceNode(
  factory.createIdentifier('string'),
  undefined
);
const EvaluationResultTypeNode = factory.createTypeReferenceNode(
  factory.createIdentifier('EvaluationResult'),
  undefined
);
const BoundExpressionTypeNode = factory.createTypeReferenceNode(
  factory.createIdentifier('BoundExpression'),
  undefined
);
const BoundUnaryOperatorTypeNode = factory.createTypeReferenceNode(
  factory.createIdentifier('BoundUnaryOperator'),
  undefined
);
const BoundBinaryOperatorTypeNode = factory.createTypeReferenceNode(
  factory.createIdentifier('BoundBinaryOperator'),
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
      factory.createIdentifier('type'),
      undefined,
      factory.createTypeReferenceNode(factory.createIdentifier('Type'), undefined)
    ),
    ...otherProperties,
  ]);

  return factory.createTypeAliasDeclaration(
    [exportKeyword],
    factory.createIdentifier(name),
    undefined,
    literalNode
  );
}

function generateConstructor(name: string, properties: Record<string, TypeNode>) {
  function constructorName() {
    return `Bound${name}`;
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
      factory.createReturnStatement(
        factory.createObjectLiteralExpression(
          [
            factory.createPropertyAssignment(
              factory.createIdentifier('kind'),
              factory.createStringLiteral(name)
            ),
            factory.createShorthandPropertyAssignment(factory.createIdentifier('type'), undefined),
            ...propertyAssignment,
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
    [
      factory.createParameterDeclaration(
        undefined,
        undefined,
        factory.createIdentifier('type'),
        undefined,
        factory.createTypeReferenceNode(factory.createIdentifier('Type'), undefined),
        undefined
      ),
      ...parameters,
    ],
    // Return type
    factory.createTypeReferenceNode(factory.createIdentifier(name), undefined),
    blockStatement
  );
}

const boundExpressionTypes: Record<string, Record<string, TypeNode>> = {
  UnaryExpression: {
    operand: BoundExpressionTypeNode,
    operator: BoundUnaryOperatorTypeNode,
  },
  BinaryExpression: {
    left: BoundExpressionTypeNode,
    operator: BoundBinaryOperatorTypeNode,
    right: BoundExpressionTypeNode,
  },
  LiteralExpression: {
    value: EvaluationResultTypeNode,
  },
  VariableExpression: {
    name: StringTypeNode,
  },
  AssignmentExpression: {
    name: StringTypeNode,
    expression: BoundExpressionTypeNode,
  },
};

const typeDeclarations = Object.entries(boundExpressionTypes).map(([name, properties]) =>
  generateExpressionType(name, properties)
);

const unionType = factory.createTypeAliasDeclaration(
  [exportKeyword],
  factory.createIdentifier('BoundExpression'),
  undefined,
  factory.createUnionTypeNode([
    ...Object.keys(boundExpressionTypes).map((name) => factory.createTypeReferenceNode(name)),
  ])
);

const constructors = Object.entries(boundExpressionTypes).map(([name, properties]) =>
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

const filePath = 'src/binding/BoundExpression.ts';

const header = fs.readFileSync(filePath).toString().split('// Generated code')[0];
fs.writeFileSync(filePath, [`${header}`, '// Generated code\n\n', generatedSource].join(''));

console.log(`Wrote generated source code to ${filePath}`);
