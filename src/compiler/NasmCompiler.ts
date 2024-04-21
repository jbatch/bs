import {
  BlockStatement,
  BoundStatement,
  ConditionalGoToStatement,
  LabelStatement,
  VariableDeclarationStatement,
} from '../binding/BoundStatement';
import fs from 'fs';
import { execSync } from 'child_process';
import { SymbolTable } from '../binding/SymbolTable';
import { FunctionSymbol, Int, String } from '../symbols/Symbol';
import { BoundExpression, CallExpression } from '../binding/BoundExpression';
import assert from 'node:assert';

export class NasmCompiler {
  blockNode: BlockStatement;
  functionTable: SymbolTable<FunctionSymbol, BlockStatement>;

  // Local variable state
  freeLocalVariableSpace: number = 0;
  nextLocalVariableOffset: number = 4;
  // TODO offset table should store how big the variable is
  // TODO local variable map should be a stack of maps
  localVariableOffset: Record<string, number> = {};
  constructor(
    blockNode: BlockStatement,
    functionTable: SymbolTable<FunctionSymbol, BlockStatement>
  ) {
    this.blockNode = blockNode;
    this.functionTable = functionTable;
  }

  compile() {
    const nasm = this.buildNasm();
    this.writeToFile(nasm);
    this.compileAssembly();
  }

  private buildNasm() {
    const header = `
; ----------------------------------------------------------------------------------------
; NASM program compiled by bsc the batchScript compiler.
; ----------------------------------------------------------------------------------------
default rel
%define SYSCALL_EXIT 0x2000001
%define SYSCALL_WRITE 0x2000004
%define STDOUT 0x1

section .bss
    numberBuffer resb 100
    numberPointer resb 8

section .data
    digit   db  0, 10                                                                        
                                                                                    
section .text                                                                        
    global start
`;
    const functions = Object.entries(this.functionTable.symbolTable)
      .map(([functionName, block]) => this.writeFunctionDeclaration(functionName, block!))
      .join('\n');
    const code = `
; print value of RAX
print_number:
    push rbp ; function prolog
    mov rbp, rsp

    mov rcx, numberBuffer       ; Store newline in first position of numberBuffer
    mov rbx, 0xA
    mov [rcx], rbx
    inc rcx                     ; numberPointer = &numberBuffer + 1
    mov [numberPointer], rcx

.loop1:
    mov rdx, 0                  ; zero out rdx before doing division
    mov rbx, 10                 ;
    div rbx                     ; rax = rax / 10, rdx = rax % 10
    push rax                    ; save division result for later
    add dl, '0'                 ; Convert digit in rdx to ascii
    mov rcx, [numberPointer]    ; rcx = &numberPointer
    mov [rcx], dl               ; copy ascii digit into numberBuffer (pointed at by numberPointer)
    inc rcx                     ; numberPointer = &numberBuffer + 1
    mov [numberPointer], rcx     
    pop rax                     ; put last division result back into rax
    cmp rax, 0                  ; check if last division was 0
    jne .loop1      ; GOTO print_number_loop1 IF rax != 0

.loop2:
    mov rcx, [numberPointer]    ; rcx = address of the last character

    mov rax, SYSCALL_WRITE      ; print character at &numberPointer to stdout
    mov rdi, STDOUT
    mov rsi, rcx
    mov rdx, 1
    syscall

    mov rcx, [numberPointer]    ; numberPointer = numberPointer - 1
    dec rcx
    mov [numberPointer], rcx

    lea rsi, [rel numberBuffer]
    cmp rcx, rsi                 ; compare numberPointer to start of numberBuffer
    jge .loop2       ; GOTO print_number_loop2 if numberPointer > numberBuffer

    pop rbp ; function epilog
    ret

start:
    push rbp
    mov rbp, rsp ; Save base pointer and store stack pointer in base point                                                                              
    ; COMPILED CODE START    
${this.blockNode.statements.map((node) => this.writeStatement(node)).join('\n')}
    ; COMPILED CODE END
 `;

    const localBytesToFree =
      Object.entries(this.localVariableOffset).length * 4 + this.freeLocalVariableSpace;
    const exit = `
    ${localBytesToFree > 0 ? `sub rsp, ${localBytesToFree}` : ''} ; free local variables
    pop rbp     ; return base pointer

    mov rax, SYSCALL_EXIT  ; exit syscall                                               
    xor rdi, rdi  ; zeroing rdi (successful termination)                             
    syscall  ; perform syscall
`;
    return header + functions + code + exit;
  }

  private writeFunctionDeclaration(functionName: string, bodyStatement: BlockStatement): string {
    return `
${functionName}: ; ${functionName}()
    push rbp ; function prolog
    mov rbp, rsp 
${bodyStatement.statements.map((statement) => this.writeStatement(statement)).join('\n')}
    pop rbp ; function epilog
    ret
`;
  }

  private writeStatement(statement: BoundStatement): string {
    switch (statement.kind) {
      case 'ExpressionStatement':
        return this.writeExpression(statement.expression);
      case 'VariableDeclarationStatement':
        return this.writeVariableDeclaration(statement);
      case 'LabelStatement':
        return this.writeLabelStatement(statement);
      case 'ConditionalGoToStatement':
        return this.writeConditionalGoToStatement(statement);
      case 'BlockStatement':
      case 'IfStatement':
      case 'WhileStatement':
      case 'ForStatement':
      case 'FunctionDeclarationStatement':
      case 'ReturnStatement':
      case 'GoToStatement':
        return `; ${statement.kind}`;
    }
  }

  writeConditionalGoToStatement(statement: ConditionalGoToStatement): string {
    if (statement.condition.kind === 'BinaryExpression') {
      switch (statement.condition.type) {
      }
    }
    return `;${statement.kind}`;
  }

  writeEvaluateExpression(expression: BoundExpression) {
    return `; ${expression.kind}`;
  }

  writeLabelStatement(statement: LabelStatement): string {
    return `${statement.label.name}:`;
  }

  writeVariableDeclaration(statement: VariableDeclarationStatement): string {
    if (
      statement.expression.kind === 'LiteralExpression' &&
      statement.expression.type.name === Int.name
    ) {
      let buffer = '';
      const name = statement.variable.name;
      const value = statement.expression.value;
      if (this.freeLocalVariableSpace < 4) {
        buffer += '\tsub rsp, 16 ; reserve 16 bytes on the stack\n';
        this.freeLocalVariableSpace += 16;
      }
      buffer += `\tmov dword [rbp - ${this.nextLocalVariableOffset}], ${value} ; var ${name} = ${value}`;
      this.localVariableOffset[name] = this.nextLocalVariableOffset;
      this.nextLocalVariableOffset += 4;
      this.freeLocalVariableSpace -= 4;
      return buffer;
    }
    return `; ${statement.kind}`;
  }

  private writeExpression(expression: BoundExpression): string {
    switch (expression.kind) {
      case 'CallExpression':
        if (this.isPrintNumberAsStringCall(expression)) {
          assert(expression.args[0].kind === 'TypeCastExpression');
          let buffer = '';
          if (expression.args[0].expression.kind === 'LiteralExpression') {
            return `
    mov rax, ${Number(expression.args[0].expression.value)}
    call print_number
                `;
          } else if (expression.args[0].expression.kind === 'VariableExpression') {
            const name = expression.args[0].expression.variable.name;
            buffer += ``;
            return `
    movzx rax, byte [rbp - ${this.localVariableOffset[name]}] ; ${name}
    call print_number`;
          }
        }
      case 'UnaryExpression':
      case 'BinaryExpression':
      case 'LiteralExpression':
      case 'VariableExpression':
      case 'AssignmentExpression':
      case 'OperatorAssignmentExpression':
      case 'PostfixUnaryExpression':
      case 'TypeCastExpression':
      case 'ErrorExpression':
        return `; Expression: ${expression.kind}`;
    }
  }

  private writeToFile(nasm: string) {
    fs.writeFileSync('build/nasm/out.asm', nasm);
  }

  private compileAssembly() {
    execSync(
      'nasm -fmacho64 build/nasm/out.asm && ld -static build/nasm/out.o -o build/nasm/out -w'
    );
    console.log('Wrote output to build/nasm/out');
  }

  private isPrintNumberAsStringCall(callExpression: CallExpression): boolean {
    return (
      callExpression.functionSymbol.name === 'print' &&
      callExpression.args[0].kind === 'TypeCastExpression' &&
      callExpression.args[0].type.name === String.name &&
      (callExpression.args[0].expression.kind === 'LiteralExpression' ||
        callExpression.args[0].expression.kind === 'VariableExpression') &&
      callExpression.args[0].expression.type.name === Int.name
    );
  }
}
