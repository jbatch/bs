// Built in Types
export const String: TypeSymbol = Type('string');
export const Bool: TypeSymbol = Type('boolean');
export const Int: TypeSymbol = Type('int');
export const Void: TypeSymbol = Type('void');
export const Err: TypeSymbol = Type('?');

// Built in Functions
export const BUILT_IN_FUNCTIONS: Record<string, FunctionSymbol | undefined> = {
  print: Function('print', Void, [Variable('text', String, true)]),
  input: Function('input', String, []),
  rand: Function('rand', Int, [Variable('min', Int, true), Variable('max', Int, true)]),
};

// Generated code

export type VariableSymbol = {
  kind: 'Variable';
  name: string;
  type: TypeSymbol;
  readonly: boolean;
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
};
export type Symbol = VariableSymbol | TypeSymbol | FunctionSymbol;
export function Variable(name: string, type: TypeSymbol, readonly: boolean): VariableSymbol {
  return {
    kind: 'Variable',
    name,
    type,
    readonly,
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
  parameters: VariableSymbol[]
): FunctionSymbol {
  return {
    kind: 'Function',
    name,
    type,
    parameters,
  };
}
