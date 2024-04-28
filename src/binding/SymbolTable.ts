import { Symbol } from '../symbols/Symbol';

export class SymbolTable<S extends Symbol, T> {
  symbolTable: Record<string, T | undefined>;
  symbols: { symbol: S; value: T }[];

  constructor(symbols: { symbol: S; value: T }[]) {
    this.symbols = symbols;
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
