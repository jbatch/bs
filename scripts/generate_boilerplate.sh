#! /usr/bin/env bash

set -euo pipefail

main() {
  yarn npx ts-node src/binding/BoundExpressionGenerator.ts
  yarn npx ts-node src/binding/BoundStatementGenerator.ts
  yarn npx ts-node src/parsing/ExpressionSyntaxGenerator.ts
  yarn npx ts-node src/parsing/StatementSyntaxGenerator.ts
  yarn npx ts-node src/parsing/TokenSyntaxGenerator.ts
  yarn prettier  --log-level silent  -w src
}

main "$@"