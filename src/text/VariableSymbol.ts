import { Type } from '../binding/BoundExpression.ts';

export type VariableSymbol = {
  kind: 'VariableSymbol';
  name: string;
  type: Type;
  readonly: boolean;
};

export function BoundVariableSymbol(name: string, type: Type, readonly: boolean): VariableSymbol {
  return {
    kind: 'VariableSymbol',
    name,
    type,
    readonly,
  };
}
