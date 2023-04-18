import { HttpOperationSecurityDeclarationTypes, IHttpOperation } from '@stoplight/types';
import type { OperationObject } from 'openapi3-ts/src/model/OpenApi';
import type { Operation } from 'swagger-schema-official';

export function translateToSecurityDeclarationType({
  security,
}: Partial<Operation | OperationObject>): IHttpOperation['securityDeclarationType'] {
  let securityDeclarationType = HttpOperationSecurityDeclarationTypes.InheritedFromService;

  if (Array.isArray(security)) {
    securityDeclarationType =
      security.length === 0
        ? HttpOperationSecurityDeclarationTypes.None
        : HttpOperationSecurityDeclarationTypes.Declared;
  }

  return securityDeclarationType;
}
