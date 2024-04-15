import { Bool } from '../symbols/Symbol';
import { BoundExpression, BoundLiteralExpression, BoundUnaryExpression } from './BoundExpression';
import { BlockStatement, BoundStatement } from './BoundStatement';
import { bindUnaryOperator } from './BoundUnaryOperator';

type BasicBlockType = 'START' | 'END' | 'CODE';
type BasicBlock = {
  id: number;
  statements: BoundStatement[];
  type: BasicBlockType;
  incoming: BasicBlockBranch[];
  outgoing: BasicBlockBranch[];
};

type BasicBlockBranch = { id: number; from: number; to: number; condition?: BoundExpression };

export class ControlFlowAnalyzer {
  statements: BoundStatement[];
  blockIdCounter = 1;
  branchIdCounter = 0;
  constructor(blockStatement: BlockStatement) {
    const isFlatBlockStatement = blockStatement.statements.every(
      (s) => s.kind !== 'BlockStatement'
    );
    if (!isFlatBlockStatement) {
      throw new Error(
        'ControlFlowAnalyzer requires the block statement to have no nested block statements'
      );
    }
    this.statements = blockStatement.statements;
  }

  public allPathsReturn(): boolean {
    const blocks = this.buildBlocks();

    // for (const b of blocks) {
    //     console.log('BLOCK ', b.id);
    //   new BoundNodePrinter(BoundBlockStatement(b.statements)).print();
    // }
    const graph = this.buildGraph(blocks);

    // Go through every incoming branch to the end.
    // If all branches end in return the whole function always returns.
    const end = graph.blocks[graph.blocks.length - 1];
    for (const branch of end.incoming) {
      const block = graph.blocks[branch.from];
      const lastStatement = block.statements[block.statements.length - 1];
      if (lastStatement.kind !== 'ReturnStatement') {
        return false;
      }
    }

    return true;
  }

  BasicCodeBlock(statement?: BoundStatement): BasicBlock {
    const statements: BoundStatement[] = statement ? [statement] : [];
    return { id: this.blockIdCounter++, statements, type: 'CODE', incoming: [], outgoing: [] };
  }

  BasicStartBlock(): BasicBlock {
    return { id: 0, statements: [], type: 'START', incoming: [], outgoing: [] };
  }

  BasicEndBlock(): BasicBlock {
    return { id: this.blockIdCounter++, statements: [], type: 'END', incoming: [], outgoing: [] };
  }

  private buildBlocks(): BasicBlock[] {
    const blocks = this.statements.reduce((blocks, statement) => {
      switch (statement.kind) {
        case 'ExpressionStatement':
        case 'VariableDeclarationStatement': {
          if (blocks.length === 0) {
            blocks.push(this.BasicCodeBlock());
          }
          blocks[blocks.length - 1].statements.push(statement);
          return blocks;
        }
        case 'LabelStatement': {
          if (blocks[blocks.length - 1].statements.length === 0) {
            blocks[blocks.length - 1].statements.push(statement);
            return blocks;
          }
          const newBlock = this.BasicCodeBlock(statement);
          return [...blocks, newBlock];
        }
        case 'GoToStatement':
        case 'ConditionalGoToStatement':
        case 'ReturnStatement':
          if (blocks.length === 0) {
            blocks.push(this.BasicCodeBlock());
          }
          blocks[blocks.length - 1].statements.push(statement);
          return [...blocks, this.BasicCodeBlock()];
        default:
          throw new Error(`Unexpected statement kind in block ${statement.kind}`);
      }
    }, [] as BasicBlock[]);
    // If the last block is empty remove it and take back it's id
    if (blocks[blocks.length - 1].statements.length === 0) {
      blocks.pop();
      this.blockIdCounter--;
    }
    return blocks;
  }

  private buildGraph(blocks: BasicBlock[]): { branches: BasicBlockBranch[]; blocks: BasicBlock[] } {
    let labelToBlock: Record<string, BasicBlock> = {};
    const start = this.BasicStartBlock();
    const end = this.BasicEndBlock();

    const branches: BasicBlockBranch[] = [];

    // Helpers
    function getBlock(n: number): BasicBlock {
      if (n === 0) {
        return start;
      }
      if (n === blocks.length + 1) {
        return end;
      }
      return blocks[n - 1];
    }

    const connect = (from: number, to: number, condition?: BoundExpression) => {
      if (condition?.kind === 'LiteralExpression') {
        if (condition.value) {
          // Connect as if no connection since it's always true
          condition = undefined;
        } else {
          // Skip connecting since the condition is not true anyway
          return;
        }
      }
      const branch = { id: this.branchIdCounter++, from, to, condition };
      branches.push(branch);
      getBlock(from).outgoing.push(branch);
      getBlock(to).incoming.push(branch);
    };

    function removeBlock(block: BasicBlock) {
      for (const branch of block.outgoing) {
        blocks[branch.from].incoming = blocks[branch.from].incoming.filter(
          (b) => b.id !== branch.id
        );
      }
      blocks = blocks.filter((b) => b.id !== block.id);
    }

    if (blocks.length === 0) {
      connect(start.id, end.id);
    } else {
      connect(start.id, blocks[0].id);
    }

    // Build list of every block that starts as a label
    for (const block of blocks) {
      for (const statement of block.statements) {
        if (statement.kind === 'LabelStatement') {
          labelToBlock[statement.label.name] = block;
        }
      }
    }

    // create a branch between every block that can connect to each other.
    for (let i = 0; i < blocks.length; i++) {
      const current = blocks[i];
      const next = i === blocks.length - 1 ? end : blocks[i + 1];

      for (let j = 0; j < current.statements.length; j++) {
        const statement = current.statements[j];
        switch (statement.kind) {
          case 'GoToStatement':
            const toBlock = labelToBlock[statement.label.name];
            connect(current.id, toBlock.id);
            break;
          case 'ConditionalGoToStatement':
            const thenBlock = labelToBlock[statement.label.name];
            const elseBlock = next;
            const negatedCondition = this.negateExpression(statement.condition);
            const thenCondition = statement.jumpIfTrue ? statement.condition : negatedCondition;
            const elseCondition = statement.jumpIfTrue ? negatedCondition : statement.condition;
            connect(current.id, thenBlock.id, thenCondition);
            connect(current.id, elseBlock.id, elseCondition);
            break;
          case 'ReturnStatement':
            // Return == connect current block to end
            connect(current.id, end.id);
            break;
          case 'ExpressionStatement':
          case 'VariableDeclarationStatement':
          case 'LabelStatement':
            // If we don't branch but it's the last statement of a block connect to the next block.
            if (j === current.statements.length - 1) {
              connect(current.id, next.id);
            }
            break;
          default:
            throw new Error(`Unexpected statement kind in block ${statement.kind}`);
        }
      }
    }

    // Keep removing blocks that are not connected until there is nothing to remove
    let removedABlock = false;
    do {
      const blocksToRemove = blocks.filter((block) => block.incoming.length === 0);
      if (blocksToRemove.length > 0) {
        removedABlock = true;
      }
      for (const block of blocksToRemove) {
        removeBlock(block);
      }
    } while (removedABlock);

    blocks.unshift(start);
    blocks.push(end);
    return { branches, blocks };
  }

  private negateExpression(expression: BoundExpression): BoundExpression {
    if (expression.kind === 'LiteralExpression') {
      return BoundLiteralExpression(Bool, !Boolean(expression.value));
    }
    const operator = bindUnaryOperator('BangToken', Bool)!;
    return BoundUnaryExpression(Bool, expression, operator);
  }
}
