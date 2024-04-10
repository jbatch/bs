#! /usr/bin/env bash

set -o pipefail

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
    git diff -s --exit-code $f
    if [[ $? -ne 0 || ! -z "$GENERATE_ALL" ]] ; 
    then 
      yarn npx ts-node $f ; 
    fi
  done  
 
  yarn prettier  --log-level silent  -w src
}

main "$@"