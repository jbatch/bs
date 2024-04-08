import utils from 'node:util';
import { createInterface } from 'node:readline';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
  history: ['for(var i = 0; i < 10; i = i + 1) { i }', 'if(1 == 1) { 2 } else { 3 }', '1+1'],
});

const inputPromise = utils.promisify(rl.question).bind(rl);
function input(prompt?: string): Promise<string> {
  return inputPromise(prompt ?? '') as unknown as Promise<string>;
}

function write(s: string | number | boolean) {
  process.stdout.write(s.toString());
}

function writeLine(s?: string | number | boolean) {
  if (s === undefined) {
    console.log();
    return;
  }
  if (typeof s === 'string') {
    console.log(`\x1b[1;32m'${s}'\x1b[1;39m`);
  } else {
    console.log(`\x1b[1;33m${s}\x1b[1;39m`);
  }
}

export default { input, write, writeLine };
