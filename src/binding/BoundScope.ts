import { VariableSymbol } from '../text/VariableSymbol.ts';

/**
 * Holds which variables are in a given scope (but not their values)
 */
export class BoundScope {
  parent?: BoundScope;
  variables: Record<string, VariableSymbol> = {};

  constructor(parent?: BoundScope) {
    this.parent = parent;
  }

  public tryDeclare(variable: VariableSymbol): boolean {
    if (this.variables[variable.name]) {
      return false;
    }
    this.variables[variable.name] = variable;
    return true;
  }

  public tryLookup(name: string): VariableSymbol | undefined {
    if (this.variables[name]) {
      return this.variables[name];
    }

    if (!this.parent) {
      return undefined;
    }

    return this.parent.tryLookup(name);
  }

  public getDecalredVariables(): VariableSymbol[] {
    return Object.values(this.variables);
  }
}
