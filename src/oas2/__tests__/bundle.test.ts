import * as fs from 'fs';
import * as path from 'path';

import { bundleOas2Service } from '../service';

describe('bundleOas2Service', () => {
  it.each(fs.readdirSync(path.join(__dirname, './__fixtures__')))(
    'given %s, should generate valid output',
    async name => {
      const document = JSON.parse(
        await fs.promises.readFile(path.join(__dirname, './__fixtures__', name, 'input.json'), 'utf8'),
      );
      const { default: output } = await import(`./__fixtures__/${name}/bundled`);

      expect(bundleOas2Service({ document })).toEqual(output);
    },
  );
});
