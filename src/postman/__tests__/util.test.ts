import { ItemGroup } from 'postman-collection';
import { transformDescriptionDefinition, transformStringValueToSchema, traverseItemsAndGroups } from '../util';

describe('transformStringValueToSchema()', () => {
  it('returns param with schema and example', () => {
    expect(transformStringValueToSchema('test')).toEqual({
      schema: { type: 'string' },
      examples: [{ key: 'default', value: 'test' }],
    });
  });
});

describe('transformDescription()', () => {
  describe('description is a string', () => {
    it('passes description through', () => {
      expect(transformDescriptionDefinition('desc')).toEqual('desc');
    });
  });

  describe('description is a definition object', () => {
    it('transforms into string', () => {
      expect(transformDescriptionDefinition({ content: 'desc' })).toEqual('desc');
    });
  });
});

describe('traverseItemsAndGroups()', () => {
  describe('itemGroup callback is defined', () => {
    it('calls both callbacks', () => {
      const mockItemCallback = jest.fn();
      const mockGroupItemCallback = jest.fn();

      traverseItemsAndGroups(new ItemGroup({ item: [{ item: [{}] }] }), mockItemCallback, mockGroupItemCallback);

      expect(mockItemCallback).toHaveBeenCalledTimes(2);
      expect(mockGroupItemCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('itemGroup callback is not defined', () => {
    it('calls callback', () => {
      const mockItemCallback = jest.fn();

      traverseItemsAndGroups(new ItemGroup({ item: [{ item: [{}] }] }), mockItemCallback);

      expect(mockItemCallback).toHaveBeenCalledTimes(2);
    });
  });
});
