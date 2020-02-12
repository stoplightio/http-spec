import { ItemGroup, Version } from 'postman-collection';
import {
  resolveVersion,
  transformDescriptionDefinition,
  transformValueToSchema,
  traverseItemsAndGroups,
} from '../util';

describe('transformValueToSchema()', () => {
  it('returns param with schema and example', () => {
    expect(transformValueToSchema('test')).toEqual({
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

      expect(mockItemCallback).toHaveBeenCalledTimes(1);
      expect(mockGroupItemCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('itemGroup callback is not defined', () => {
    it('calls callback', () => {
      const mockItemCallback = jest.fn();

      traverseItemsAndGroups(new ItemGroup({ item: [{ item: [{}] }] }), mockItemCallback);

      expect(mockItemCallback).toHaveBeenCalledTimes(1);
    });
  });
});

describe('resolveVersion()', () => {
  describe('version is defined as string', () => {
    it('transforms correctly', () => {
      expect(resolveVersion(new Version('1.2.3-4'))).toEqual('1.2.3-4');
    });
  });

  describe('version is defined as string', () => {
    it('transforms correctly', () => {
      expect(resolveVersion(new Version({ major: '1', minor: '2', patch: '3', prerelease: '4' }))).toEqual('1.2.3-4');
    });
  });
});
