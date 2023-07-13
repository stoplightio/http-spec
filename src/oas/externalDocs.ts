import { IExternalDocs } from '@stoplight/types';

export function toExternalDocs(externalDocs: any): { externalDocs?: IExternalDocs } | undefined {
  if (!externalDocs) return undefined;
  if (typeof externalDocs !== 'object') return undefined;
  if (!externalDocs?.url) return undefined;

  const result: IExternalDocs = { url: externalDocs.url };
  if (externalDocs.description) result['description'] = externalDocs.description;
  return { externalDocs: result };
}
