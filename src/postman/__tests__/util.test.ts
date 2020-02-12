import { Version } from 'postman-collection';
import { resolveVersion, transformDescriptionDefinition, transformValueToSchema } from '../util';

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
