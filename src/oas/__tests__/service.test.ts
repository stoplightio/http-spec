import { transformOas2Service } from '../../oas2/service';
import { transformOas3Service } from '../../oas3/service';

import * as oas2KitchenSinkJson from './fixtures//oas2-kitchen-sink.json';
import * as oas3KitchenSinkJson from './fixtures//oas3-kitchen-sink.json';

describe('oas service', () => {
  test('openapi v2', () => {
    expect(transformOas2Service({ document: oas2KitchenSinkJson as any })).toMatchSnapshot();
  });

  test('openapi v3', () => {
    expect(transformOas3Service({ document: oas3KitchenSinkJson as any })).toMatchSnapshot();
  });

  test('openapi v2 and v3 should transform in the same way', () => {
    const oas2MappedService = transformOas2Service({ document: oas2KitchenSinkJson as any });
    const oas3MappedService = transformOas3Service({ document: oas3KitchenSinkJson as any });
    expect(oas2MappedService).toEqual(oas3MappedService);
  });
});
