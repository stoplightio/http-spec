import { IExternalDocs } from '@stoplight/types';

/**
 * Extract an OpanAPI `externalDocs` object
 * @return an object that includes an `externalDocs` object with all well-formed
 * properties from the supplied object, or an empty object
 */
export function toExternalDocs(externalDocs: any): { externalDocs?: IExternalDocs } {
  if (!externalDocs || typeof externalDocs !== 'object') {
    return {};
  }

  const url = getUrl(externalDocs);
  if (url === undefined) {
    return {};
  }

  const description = getDescription(externalDocs);
  const descriptionProp = description ? { description } : {};

  return {
    externalDocs: {
      url,
      ...descriptionProp,
    },
  };
}

const ALL_WHITESPACE: RegExp = /^\s*$/;

/**
 * @returns the `url` property, or undefined if the object lacks it
 */
function getUrl(externalDocs: { url?: any } | undefined): string | undefined {
  const url = externalDocs?.url;
  if (!url || typeof url !== 'string' || ALL_WHITESPACE.test(url)) {
    return undefined;
  }

  return url;
}

/**
 * @returns the `description` property, or undefined if the object lacks it
 */
function getDescription(externalDocs: { description?: any }): string | undefined {
  const description = externalDocs.description;
  if (!description || typeof description !== 'string' || ALL_WHITESPACE.test(description)) {
    return undefined;
  }

  return description;
}
