import { ItemGroup } from 'postman-collection';
import {
  transformDescriptionDefinition,
  transformPostmanTemplate,
  transformValueTemplateToSchema,
  transformValueToHttpParam,
  traverseItemsAndGroups,
} from '../util';

describe('transformValueTemplateToSchema()', () => {
  it('maps <string>', () => {
    expect(transformValueTemplateToSchema('<string>')).toEqual({ type: 'string' });
  });

  it('maps <long>', () => {
    expect(transformValueTemplateToSchema('<long>')).toEqual({ type: 'integer' });
  });

  it('returns nothing if no match', () => {
    expect(transformValueTemplateToSchema('<unknown>')).toBeUndefined();
  });
});

describe('transformValueToHttpParam()', () => {
  describe('input is a value template', () => {
    describe('input is known value template', () => {
      it('returns schema', () => {
        expect(transformValueToHttpParam('<string>')).toEqual({ schema: { type: 'string' } });
      });
    });

    describe('input is unknown value template', () => {
      it('throws an error', () => {
        expect(() => transformValueToHttpParam('<unknown>')).toThrowError('Fix me: unknown value template: <unknown>');
      });
    });
  });

  describe('input is not a value template', () => {
    it('returns param with example', () => {
      expect(transformValueToHttpParam('test')).toEqual({ examples: [{ key: 'default', value: 'test' }] });
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

describe('transformPostmanTemplate()', () => {
  it('transforms template correctly', () => {
    expect(transformPostmanTemplate({ a: [1, 2], b: '<string>' })).toEqual({
      properties: {
        a: {
          items: { type: 'integer' },
          type: 'array',
        },
        b: { type: 'string' },
      },
      type: 'object',
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
