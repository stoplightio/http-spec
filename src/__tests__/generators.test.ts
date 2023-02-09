import { idGenerators } from '../generators';

describe('idGenerators', () => {
  it('httpOperation ids should be unique', () => {
    const operation1 = { parentId: '12345', method: 'post', path: '/test/path/{id}' };
    const operation2 = { parentId: '12345', method: 'post', path: '/test/path/id' };
    const id1 = idGenerators.httpOperation(operation1);
    const id2 = idGenerators.httpOperation(operation2);
    expect(id1).toEqual('http_operation-12345-post-/test/path/{}');
    expect(id2).toEqual('http_operation-12345-post-/test/path/id');
    expect(id1).not.toEqual(id2);
  });
  it('httpOperation ids should be data resilient', () => {
    const operation1 = { parentId: '12345', method: 'post', path: '/test/path/{id}' };
    const operation2 = { parentId: '12345', method: 'post', path: '/test/path/{name}' };
    const id1 = idGenerators.httpOperation(operation1);
    const id2 = idGenerators.httpOperation(operation2);
    expect(id1).toEqual('http_operation-12345-post-/test/path/{}');
    expect(id2).toEqual('http_operation-12345-post-/test/path/{}');
    expect(id1).toEqual(id2);
  });
  it('httpCallbackOperation ids should be unique', () => {
    const operation1 = { parentId: '12345', method: 'post', path: '{$request.body#/returnedPetAdoptedUrl}' };
    const operation2 = { parentId: '12345', method: 'post', path: '{$request.body#/newPetAvailableUrl}' };
    const id1 = idGenerators.httpCallbackOperation(operation1);
    const id2 = idGenerators.httpCallbackOperation(operation2);
    expect(id1).toEqual('http_callback-12345-post-{$request.body#/returnedPetAdoptedUrl}');
    expect(id2).toEqual('http_callback-12345-post-{$request.body#/newPetAvailableUrl}');
    expect(id1).not.toEqual(id2);
  });
});
