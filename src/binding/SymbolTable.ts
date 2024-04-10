import { Symbol } from '../symbols/Symbol';

export class SymbolTable<S extends Symbol, T> {
  symbolTable: Record<string, T | undefined>;

  constructor(symbols: { symbol: S; value: T }[]) {
    this.symbolTable = symbols.reduce(
      (prev, cur) => ({ ...prev, [cur.symbol.name]: cur.value }),
      {}
    );
  }

  getValue(symbol: S) {
    return this.symbolTable[symbol.name];
  }

  setValue(symbol: S, value: T) {
    this.symbolTable[symbol.name] = value;
  }
}
