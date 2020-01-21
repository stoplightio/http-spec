import { CollectionDefinition } from 'postman-collection';
import { transformPostmanCollectionService } from '../service';

describe('postman collection service', () => {
  const postmanCollection = require('./fixtures/petstore.json') as CollectionDefinition;

  it('transform info section', () => {
    expect(transformPostmanCollectionService(postmanCollection)).toEqual({
      id: '000bb1af-1d34-4263-8ef5-c06230bdc905',
      name: 'Swagger Petstore',
      version: '1.0.0',
      description:
        'This is a sample server Petstore server.  You can find out more about Swagger at [http://swagger.io](http://swagger.io) or on [irc.freenode.net, #swagger](http://swagger.io/irc/).  For this sample, you can use the api key `special-key` to test the authorization filters.\n\nContact Support:\n Email: apiteam@swagger.io',
      securitySchemes: [
        {
          in: 'query',
          key: 'apiKey-0',
          name: 'ApiKey',
          type: 'apiKey',
        },
      ],
    });
  });
});
