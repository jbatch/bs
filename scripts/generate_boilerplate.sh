#! /usr/bin/env bash

set -eo pipefail

# if [[ ! -z "$GENERATE_ALL" || -z `git diff -s --exit-code` ]]  ; then echo "yes"; else echo "no"; fi

# exit 0

main() {
  declare -a sources=(
    src/binding/BoundExpressionGenerator.ts
    src/binding/BoundStatementGenerator.ts
    src/parsing/ExpressionSyntaxGenerator.ts
    src/parsing/StatementSyntaxGenerator.ts
    src/parsing/TokenSyntaxGenerator.ts
    src/parsing/ContainerNodeGenerator.ts
    src/symbols/SymbolGenerator.ts
  )
  for f in "${sources[@]}"
  do
    # Only try to generate sources if generator file has changed 
    if [[ ! -z "$GENERATE_ALL" || -z $"git diff -s --exit-code $f" ]]  ; then  yarn npx ts-node $f ; fi
  done  
 
  yarn prettier  --log-level silent  -w src
}

main "$@"