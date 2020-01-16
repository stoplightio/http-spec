import { Collection, CollectionDefinition, RequestAuth } from "postman-collection";
import { readFileSync } from 'fs'

const c = JSON.parse(readFileSync('/Users/vncz/Downloads/p.json', { encoding: 'utf8' }));

const collection = new Collection(c);

const resolvedCollection =
  new Collection(collection.toObjectResolved({ variables: collection.variables }, []));

const itemGroupAuth: RequestAuth[] = [];
const itemAuth: RequestAuth[] = [];

resolvedCollection.forEachItemGroup(itemGroup => { if (itemGroup.auth) itemGroupAuth.push(itemGroup.auth) })
resolvedCollection.forEachItem(item => { if (item.auth) itemAuth.push(item.auth) })


console.log(JSON.stringify(itemGroupAuth, null, 1));

console.log("\n")

console.log(JSON.stringify(itemAuth, null, 1));
