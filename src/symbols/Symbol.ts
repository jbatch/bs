export const String: TypeSymbol = Type('string');
export const Bool: TypeSymbol = Type('boolean');
export const Int: TypeSymbol = Type('int');
export const Err: TypeSymbol = Type('?');

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
export type Symbol = VariableSymbol | TypeSymbol;
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
