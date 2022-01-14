import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { transformOas2Operations } from '../../oas2/operation';
import { transformOas3Operations } from '../../oas3/operation';

const oas2KitchenSinkJson = JSON.parse(
  await fs.promises.readFile(path.join(fileURLToPath(import.meta.url), '../fixtures/oas2-kitchen-sink.json'), 'utf8'),
);
const oas3KitchenSinkJson = JSON.parse(
  await fs.promises.readFile(path.join(fileURLToPath(import.meta.url), '../fixtures/oas3-kitchen-sink.json'), 'utf8'),
);

describe('oas operation', () => {
  it('openapi v2', () => {
    const result = transformOas2Operations(oas2KitchenSinkJson);

    expect(result).toHaveLength(5);
    expect(result).toMatchSnapshot();
  });

  it('openapi v3', () => {
    const result = transformOas3Operations(oas3KitchenSinkJson);

    expect(result).toHaveLength(3);
    expect(result).toMatchSnapshot();
  });
});
