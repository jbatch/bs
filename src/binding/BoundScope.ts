import { BUILT_IN_FUNCTIONS, FunctionSymbol, VariableSymbol } from '../symbols/Symbol';

/**
 * Holds which variables are in a given scope (but not their values)
 */
export class BoundScope {
  parent?: BoundScope;
  variables: Record<string, VariableSymbol> = {};
  functions: Record<string, FunctionSymbol> = {};

  constructor(parent?: BoundScope) {
    this.parent = parent;
  }

  static createRootScope(): BoundScope {
    const scope = new BoundScope();
    for (let fn of Object.values(BUILT_IN_FUNCTIONS)) {
      if (fn === undefined) {
        continue;
      }
      scope.tryDeclareFunction(fn);
    }
    return scope;
  }

  public tryDeclareVariable(variable: VariableSymbol): boolean {
    if (this.variables[variable.name]) {
      return false;
    }
    this.variables[variable.name] = variable;
    return true;
  }

  public tryDeclareFunction(func: FunctionSymbol): boolean {
    if (this.functions[func.name]) {
      return false;
    }
    this.functions[func.name] = func;
    return true;
  }

  public tryLookupVariable(name: string): VariableSymbol | undefined {
    if (this.variables[name]) {
      return this.variables[name];
    }

    if (!this.parent) {
      return undefined;
    }

    return this.parent.tryLookupVariable(name);
  }

  public tryLookupFunction(name: string): FunctionSymbol | undefined {
    if (this.functions[name]) {
      return this.functions[name];
    }

    if (!this.parent) {
      return undefined;
    }

    return this.parent.tryLookupFunction(name);
  }

  public getDecalredVariables(): VariableSymbol[] {
    if (this.parent) {
      return [...this.parent.getDecalredVariables(), ...Object.values(this.variables)];
    }
    return Object.values(this.variables);
  }

  public getDecalredFunctions(): FunctionSymbol[] {
    if (this.parent) {
      return [...this.parent.getDecalredFunctions(), ...Object.values(this.functions)];
    }
    return Object.values(this.functions);
  }
}
