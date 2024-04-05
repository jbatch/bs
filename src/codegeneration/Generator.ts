import ts, { Expression, Statement, TypeAliasDeclaration, TypeNode, factory } from 'typescript';
import fs from 'fs';

export const exportKeyword = factory.createToken(ts.SyntaxKind.ExportKeyword);

function isDefined<T>(node: T | undefined): node is T {
  return node !== undefined;
}

// Type Nodes
export const TokenSyntaxTypeNode = factory.createTypeReferenceNode(
  factory.createIdentifier('TokenSyntax'),
  undefined
);
export const ExpressionSyntaxTypeNode = factory.createTypeReferenceNode(
  factory.createIdentifier('ExpressionSyntax'),
  undefined
);
export const TextSpanTypeNode = factory.createTypeReferenceNode(
  factory.createIdentifier('TextSpan'),
  undefined
);
export const SyntaxNodeTypeNode = factory.createTypeReferenceNode(
  factory.createIdentifier('SyntaxNode'),
  undefined
);
export const StatementSyntaxTypeNode = factory.createTypeReferenceNode(
  factory.createIdentifier('StatementSyntax'),
  undefined
);

export const BoundStatementTypeNode = factory.createTypeReferenceNode(
  factory.createIdentifier('BoundStatement'),
  undefined
);
export const BoundExpressionTypeNode = factory.createTypeReferenceNode(
  factory.createIdentifier('BoundExpression'),
  undefined
);
export const VariableSymbolTypeNode = factory.createTypeReferenceNode(
  factory.createIdentifier('VariableSymbol'),
  undefined
);
export const BoundUnaryOperatorTypeNode = factory.createTypeReferenceNode(
  factory.createIdentifier('BoundUnaryOperator'),
  undefined
);
export const BoundBinaryOperatorTypeNode = factory.createTypeReferenceNode(
  factory.createIdentifier('BoundBinaryOperator'),
  undefined
);
export const EvaluationResultTypeNode = factory.createTypeReferenceNode(
  factory.createIdentifier('EvaluationResult'),
  undefined
);
export const StringTypeNode = factory.createTypeReferenceNode(
  factory.createIdentifier('string'),
  undefined
);
export const TypeTypeNode = factory.createTypeReferenceNode(
  factory.createIdentifier('Type'),
  undefined
);
export const IdentifierTokenSyntaxTypeNode = factory.createTypeReferenceNode(
  factory.createIdentifier('IdentifierTokenSyntax'),
  undefined
);
export const NumberTokenSyntaxTypeNode = factory.createTypeReferenceNode(
  factory.createIdentifier('NumberTokenSyntax'),
  undefined
);
export const NumberTypeNode = factory.createTypeReferenceNode(
  factory.createIdentifier('number'),
  undefined
);

export type TypeNodeMap = Record<string, TypeNode>;

function filterDefined(expressions: Expression) {
  return factory.createCallExpression(
    factory.createPropertyAccessExpression(expressions, factory.createIdentifier('filter')),
    undefined,
    [factory.createIdentifier('isDefined')]
  );
}

export function array(node: TypeNode): TypeNode {
  return factory.createArrayTypeNode(node);
}

export function optional(node: TypeNode): TypeNode {
  return factory.createUnionTypeNode([
    node,
    factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword),
  ]);
}

export function createConstructorParameters(properties: TypeNodeMap) {
  return Object.entries(properties).map(([propertyName, propertyType]) => {
    return factory.createParameterDeclaration(
      undefined,
      undefined,
      factory.createIdentifier(propertyName),
      undefined,
      propertyType,
      undefined
    );
  });
}

export function createSpanDeclarationStatement(properties: TypeNodeMap) {
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

export function createChildrenDeclarationStatment(properties: TypeNodeMap) {
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
          array(SyntaxNodeTypeNode),
          expressions
        ),
      ],
      ts.NodeFlags.Const
    )
  );
}

export function createPropertyAssignments(properties: TypeNodeMap) {
  return Object.keys(properties).map((propertyName) => {
    return factory.createShorthandPropertyAssignment(
      factory.createIdentifier(propertyName),
      undefined
    );
  });
}

function generateTypeDeclaration(
  name: string,
  properties: TypeNodeMap,
  prefix: string,
  suffix: string,
  hasSpan: boolean,
  hasChildren: boolean
) {
  const otherProperties = Object.entries(properties).map(([propertyName, propertyType]) =>
    factory.createPropertySignature(
      undefined,
      factory.createIdentifier(propertyName),
      undefined,
      propertyType
    )
  );
  const span = hasSpan
    ? factory.createPropertySignature(
        undefined,
        factory.createIdentifier('span'),
        undefined,
        TextSpanTypeNode
      )
    : undefined;
  const children = hasChildren
    ? factory.createPropertySignature(
        undefined,
        factory.createIdentifier('children'),
        undefined,
        array(SyntaxNodeTypeNode)
      )
    : undefined;
  const propertyNodes = [
    factory.createPropertySignature(
      undefined,
      factory.createIdentifier('kind'),
      undefined,
      factory.createLiteralTypeNode(factory.createStringLiteral(name))
    ),
    span,
    ...otherProperties,
    children,
  ].filter(isDefined);

  const literalNode = factory.createTypeLiteralNode(propertyNodes);

  return factory.createTypeAliasDeclaration(
    [exportKeyword],
    factory.createIdentifier(`${prefix}${name}${suffix}`),
    undefined,
    literalNode
  );
}

factory.createArrayLiteralExpression();

function generateConstructor(
  name: string,
  properties: TypeNodeMap,
  typePrefix: string,
  typeSuffix: string,
  constructorPrefix: string,
  constructorSuffix: string,
  hasSpan: boolean,
  hasChildren: boolean,
  emptyChildren: boolean
) {
  function constructorName() {
    return `${constructorPrefix}${name}${constructorSuffix}`;
  }

  const parameters = createConstructorParameters(properties);
  const spanDeclareation = hasSpan ? createSpanDeclarationStatement(properties) : undefined;
  const childrenDeclaration = hasChildren
    ? createChildrenDeclarationStatment(emptyChildren ? {} : properties)
    : undefined;
  const propertyAssignments = createPropertyAssignments(properties);

  const span = hasSpan
    ? factory.createShorthandPropertyAssignment(factory.createIdentifier('span'), undefined)
    : undefined;
  const children = hasChildren
    ? factory.createShorthandPropertyAssignment(factory.createIdentifier('children'), undefined)
    : undefined;
  const returnNode = factory.createReturnStatement(
    factory.createObjectLiteralExpression(
      [
        factory.createPropertyAssignment(
          factory.createIdentifier('kind'),
          factory.createStringLiteral(name)
        ),
        span,
        ...propertyAssignments,
        children,
      ].filter(isDefined),
      true
    )
  );

  const statements: Statement[] = [spanDeclareation, childrenDeclaration, returnNode].filter(
    isDefined
  );
  const blockStatement = factory.createBlock(statements, true);

  return factory.createFunctionDeclaration(
    [factory.createToken(ts.SyntaxKind.ExportKeyword)],
    undefined,
    factory.createIdentifier(constructorName()),
    undefined,
    [...parameters],
    // Return type
    factory.createTypeReferenceNode(
      factory.createIdentifier(`${typePrefix}${name}${typeSuffix}`),
      undefined
    ),
    blockStatement
  );
}

type GeneratorOptions = {
  typePrefix?: string;
  typeSuffix?: string;
  constructorPrefix?: string;
  constructorSuffix?: string;
  hasChildren?: boolean;
  hasSpan?: boolean;
  emptyChildren?: boolean;
};

export class Generator {
  name: string;
  filepath: string;
  types: Record<string, TypeNodeMap>;
  options: GeneratorOptions;

  constructor(
    name: string,
    filepath: string,
    types: Record<string, TypeNodeMap>,
    options: GeneratorOptions
  ) {
    this.name = name;
    this.filepath = filepath;
    this.types = types;
    this.options = options;
  }

  public run() {
    const typeDeclarations = this.createTypeDeclarations();
    const unionType = this.createUnionType(typeDeclarations);
    const constructors = this.createConstructors();
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

    const header = fs.readFileSync(this.filepath).toString().split('// Generated code')[0];
    fs.writeFileSync(
      this.filepath,
      [`${header}`, '// Generated code\n\n', generatedSource].join('')
    );

    console.log(`Wrote generated source code to ${this.filepath}`);
  }

  public createTypeDeclarations() {
    return Object.entries(this.types).map(([name, property]) =>
      generateTypeDeclaration(
        name,
        property,
        this.options.typePrefix ?? '',
        this.options.typeSuffix ?? '',
        !!this.options.hasSpan,
        !!this.options.hasChildren
      )
    );
  }

  public createUnionType(typeDeclarations: TypeAliasDeclaration[]) {
    return factory.createTypeAliasDeclaration(
      [exportKeyword],
      factory.createIdentifier(`${this.name}`),
      undefined,
      factory.createUnionTypeNode([
        ...Object.values(typeDeclarations).map((t) => factory.createTypeReferenceNode(t.name)),
      ])
    );
  }

  public createConstructors() {
    return Object.entries(this.types).map(([name, properties]) =>
      generateConstructor(
        name,
        properties,
        this.options.typePrefix ?? '',
        this.options.typeSuffix ?? '',
        this.options.constructorPrefix ?? '',
        this.options.constructorSuffix ?? '',
        !!this.options.hasSpan,
        !!this.options.hasChildren,
        !!this.options.emptyChildren
      )
    );
  }
}
