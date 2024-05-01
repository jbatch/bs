# BS

BS (batchScript) is a toy programming language for the purpose of learning to build a compiler. 

The project started with following the [Building a Compiler series][bacs] but in TypeScript. It has diverged since getting to code generation.

BS has an interpreter and a compiler. The interpreter is written in Typescript and the compiler translates the AST into [LLVM IR][llvmir] which is compiled to machine code.

## Prerequisites
* yarn
* clang
* llvm@14

## Install
Install dependencies
```
yarn
```
Build the TS
```
yarn tsc
# yarn tsc -w to run in watch mode
```

## Usage

Start the REPL
```
yarn dev
```

Run the compiler (compiling too LLVM IR)
```
yarn bsc -l ./programs/guess.bs
# Run the compiled code
./build/llvm/out
```

## The Language

batchScript is still pretty basic. It supports:
* Data types: currently `int`, `bool`, `string`
* Type checking: static typing and compile time type checking
* Control structures: currently `if`/`else`, `for` and `while`
* Functions: Very basic support for functions that take variables that are scoped and optional returning a value
* Standard Library: The standard library currently only supports:
    *  `print(s: string)`
    * `input(): string`
    *  `rand(from: int, to: int): int`

## Future features
On the TODO list for batchScript:
* Tests
* Switch
* Error handling
* Memory management
* Object Orientation
* Concurrency/Parallelism
* First class functions, anonymous functions 
* Modules
* Metaprogramming

[bacs]: https://www.youtube.com/playlist?list=PLRAdsfhKI4OWNOSfS7EUu5GRAVmze1t2y
[llvmir]: [https://llvm.org/docs/LangRef.html]