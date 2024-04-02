import { Type } from '../binding/BoundExpression';

export type VariableSymbol = { name: string; type: Type; readonly: boolean };
