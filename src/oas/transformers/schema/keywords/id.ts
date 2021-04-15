import { Converter } from '../types';

const convertId: Converter = schema => {
  if (!('id' in schema)) return;
  const { id } = schema;
  delete schema.id;
  if (typeof id === 'string') {
    schema.$id = id;
  }
};

export default { id: convertId };
