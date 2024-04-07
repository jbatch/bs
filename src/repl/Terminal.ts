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
  console.log(s ?? '');
}

export default { input, write, writeLine };
