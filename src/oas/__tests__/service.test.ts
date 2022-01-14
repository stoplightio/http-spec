import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { transformOas2Service } from '../../oas2/service';
import { transformOas3Service } from '../../oas3/service';

const oas2KitchenSinkJson = JSON.parse(
  await fs.promises.readFile(path.join(fileURLToPath(import.meta.url), '../fixtures/oas2-kitchen-sink.json'), 'utf8'),
);
const oas3KitchenSinkJson = JSON.parse(
  await fs.promises.readFile(path.join(fileURLToPath(import.meta.url), '../fixtures/oas3-kitchen-sink.json'), 'utf8'),
);

describe('oas service', () => {
  it('openapi v2', () => {
    expect(transformOas2Service({ document: oas2KitchenSinkJson })).toMatchSnapshot();
  });

  it('openapi v3', () => {
    expect(transformOas3Service({ document: oas3KitchenSinkJson })).toMatchSnapshot();
  });

  it('openapi v2 and v3 should transform in the same way', () => {
    const oas2MappedService = transformOas2Service({ document: oas2KitchenSinkJson });
    const oas3MappedService = transformOas3Service({ document: oas3KitchenSinkJson });
    expect(oas2MappedService).toStrictEqual(oas3MappedService);
  });
});
