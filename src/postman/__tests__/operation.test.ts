import { transformPostmanCollectionOperation } from '../operation';

describe('transformPostmanCollectionOperation()', () => {
  it('works', () => {
    const x = transformPostmanCollectionOperation({
      document: require('./fixtures/petstore.json'),
      method: 'put',
      path: '/pet/{petId}',
    });

    console.log(JSON.stringify(x, null, 2));
  });
});
