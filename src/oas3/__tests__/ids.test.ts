import * as fs from 'fs';
import * as path from 'path';

import { transformOas3Operations } from '../operation';
import { transformOas3Service } from '../service';

describe('transformOas3Service', () => {
  it.each(fs.readdirSync(path.join(__dirname, './__fixtures__')))(
    'given %s, should generate proper ids',
    async name => {
      const document = JSON.parse(
        await fs.promises.readFile(path.join(__dirname, './__fixtures__', name, 'input.json'), 'utf8'),
      );
      const { default: output } = await import(`./__fixtures__/${name}/legacy`);

      expect([transformOas3Service({ document }), ...transformOas3Operations(document)]).toEqual(output);
    },
  );
});
