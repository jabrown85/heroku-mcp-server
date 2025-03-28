import { expect } from 'chai';
import { spawnSync } from 'node:child_process';
import * as path from 'node:path';

const bin = path.join(__dirname, '../../dist/index.js');

function run(args: string[] = []) {
  return spawnSync(bin, args);
}

describe('MCP server run', function () {
  it('should run', async () => {
    const { stdout } = run();
    expect(stdout.toString()).to.eq('Heroku Platform MCP Server\n');
  });
});
