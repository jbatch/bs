import fs from 'fs';
import { createInterface } from 'node:readline';
import utils from 'node:util';

function completer(line: string) {
  if (line.startsWith('.l')) {
    const files = fs.readdirSync('./programs');
    const completions = files.map((f) => `.load programs/${f}`).filter((f) => f.startsWith(line));
    return [completions, line];
  }
  const completions = ['.load', '.showTree', '.showProgram', '.exit'];
  const options = completions.filter((c) => c.startsWith(line));
  return [options, line];
}
// function Fib(n) {
//   if (n <= 1) {
//     return n;
//   } else {
//     return Fib(n - 1) + Fib(n - 2);
//   }
// }

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
  history: [
    'function count(n: Int) { print(string(n)) if (n > 0) { count(n - 1) } }',
    'for(var i = 0; i < 10; i = i + 1) { i }',
    'if(1 == 1) { 2 } else { 3 }',
    '1+1',
  ],
  completer,
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
