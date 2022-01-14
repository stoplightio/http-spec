import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { transformOas3Operations } from '../operation';
import { transformOas3Service } from '../service';

test('should generate proper ids', async () => {
  const document = JSON.parse(
    await fs.promises.readFile(path.join(fileURLToPath(import.meta.url), '../../__fixtures__/id.json'), 'utf8'),
  );
  const { default: output } = await import('../__fixtures__/output');

  expect([transformOas3Service({ document }), ...transformOas3Operations(document)]).toEqual(output);
});
