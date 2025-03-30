import { register } from 'ts-node';
import { pathToFileURL } from 'node:url';

register({
  transpileOnly: true,
  esm: true,
  compilerOptions: {
    module: 'ESNext',
    moduleResolution: 'node'
  }
});
register('ts-node/esm', pathToFileURL('./'));
