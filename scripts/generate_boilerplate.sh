#! /usr/bin/env bash

set -euo pipefail

main() {
  yarn npx ts-node src/binding/BoundExpressionGenerator.ts
  yarn npx ts-node src/binding/BoundStatementGenerator.ts
  yarn npx ts-node src/parsing/ExpressionSyntaxGenerator.ts
  yarn prettier  --log-level silent  -w src
}

main "$@"