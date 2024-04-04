import ts, { TypeNode, factory } from 'typescript';
import fs from 'fs';

const exportKeyword = factory.createToken(ts.SyntaxKind.ExportKeyword);

function optional(node: TypeNode): TypeNode {
  return factory.createUnionTypeNode([
    node,
    factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword),
  ]);
}

function array(node: TypeNode): TypeNode {
  return factory.createArrayTypeNode(node);
}

// TypeNodes
const BoundStatementTypeNode = factory.createTypeReferenceNode(
  factory.createIdentifier('BoundStatement'),
  undefined
);
const OptionalBoundStatementTypeNode = optional(BoundStatementTypeNode);
const BoundStatementArrayTypeNode = array(BoundStatementTypeNode);
const BoundExpressionTypeNode = factory.createTypeReferenceNode(
  factory.createIdentifier('BoundExpression'),
  undefined
);
const VariableSymbolTypeNode = factory.createTypeReferenceNode(
  factory.createIdentifier('VariableSymbol'),
  undefined
);

function generateStatementType(name: string, properties: Record<string, TypeNode>) {
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
    ...otherProperties,
  ]);

  return factory.createTypeAliasDeclaration(
    [exportKeyword],
    factory.createIdentifier(name),
    undefined,
    literalNode
  );
}

function generateConstructor(
  name: string,
  properties: Record<string, TypeNode>,
  optinoalProperties?: Set<string>
) {
  const parameters = Object.entries(properties).map(([propertyName, propertyType]) => {
    const questionToken = optinoalProperties?.has(name)
      ? factory.createToken(ts.SyntaxKind.QuestionToken)
      : undefined;
    return factory.createParameterDeclaration(
      undefined,
      undefined,
      factory.createIdentifier(propertyName),
      questionToken,
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
    factory.createIdentifier(`Bound${name}`),
    undefined,
    [...parameters],
    // Return type
    factory.createTypeReferenceNode(factory.createIdentifier(name), undefined),
    blockStatement
  );
}

const boundStatementTypes: Record<string, Record<string, TypeNode>> = {
  ExpressionStatement: {
    expression: BoundExpressionTypeNode,
  },
  BlockStatement: {
    statements: BoundStatementArrayTypeNode,
  },
  VariableDelcarationStatement: {
    variable: VariableSymbolTypeNode,
    expression: BoundExpressionTypeNode,
  },
  IfStatement: {
    condition: BoundExpressionTypeNode,
    ifBlock: BoundStatementTypeNode,
    elseBlock: OptionalBoundStatementTypeNode,
  },
  WhileStatement: {
    loopCondition: BoundExpressionTypeNode,
    whileBlock: BoundStatementTypeNode,
  },
  ForStatement: {
    beginStatement: BoundStatementTypeNode,
    loopCondition: BoundExpressionTypeNode,
    endStatement: BoundStatementTypeNode,
    forBlock: BoundStatementTypeNode,
  },
};

const typeDeclarations = Object.entries(boundStatementTypes).map(([name, properties]) =>
  generateStatementType(name, properties)
);

const unionType = factory.createTypeAliasDeclaration(
  [exportKeyword],
  factory.createIdentifier('BoundStatement'),
  undefined,
  factory.createUnionTypeNode([
    ...Object.keys(boundStatementTypes).map((name) => factory.createTypeReferenceNode(name)),
  ])
);

const constructors = Object.entries(boundStatementTypes).map(([name, properties]) =>
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

const filePath = 'src/binding/BoundStatement.ts';

const header = fs.readFileSync(filePath).toString().split('// Generated code')[0];
fs.writeFileSync(filePath, [`${header}`, '// Generated code\n\n', generatedSource].join(''));

console.log(`Wrote generated source code to ${filePath}`);
