import { FunctionDeclarationSyntax } from '../parsing/StatementSyntax';

// Built in Types
export const String: TypeSymbol = Type('string');
export const Bool: TypeSymbol = Type('boolean');
export const Int: TypeSymbol = Type('int');
export const Void: TypeSymbol = Type('void');
export const Err: TypeSymbol = Type('?');

export const CASTABLE_TYPES: Record<string, TypeSymbol | undefined> = {
  string: String,
  bool: Bool,
  int: Int,
};

// Built in Functions
export const BUILT_IN_FUNCTIONS: Record<string, FunctionSymbol | undefined> = {
  print: Function('print', Void, [Variable('text', String, true, true)], undefined),
  input: Function('input', String, [], undefined),
  rand: Function(
    'rand',
    Int,
    [Variable('min', Int, true, true), Variable('max', Int, true, true)],
    undefined
  ),
};

// Generated code

export type VariableSymbol = {
  kind: 'Variable';
  name: string;
  type: TypeSymbol;
  readonly: boolean;
  isLocal: boolean;
};
export type TypeSymbol = {
  kind: 'Type';
  name: string;
};
export type FunctionSymbol = {
  kind: 'Function';
  name: string;
  type: TypeSymbol;
  parameters: VariableSymbol[];
  declaration: FunctionDeclarationSyntax | undefined;
};
export type Symbol = VariableSymbol | TypeSymbol | FunctionSymbol;
export function Variable(
  name: string,
  type: TypeSymbol,
  readonly: boolean,
  isLocal: boolean
): VariableSymbol {
  return {
    kind: 'Variable',
    name,
    type,
    readonly,
    isLocal,
  };
}
export function Type(name: string): TypeSymbol {
  return {
    kind: 'Type',
    name,
  };
}
export function Function(
  name: string,
  type: TypeSymbol,
  parameters: VariableSymbol[],
  declaration: FunctionDeclarationSyntax | undefined
): FunctionSymbol {
  return {
    kind: 'Function',
    name,
    type,
    parameters,
    declaration,
  };
}
