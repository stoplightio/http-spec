import { Dictionary } from './basic';
import { INodeVariable } from './graph';
export interface IServer {
    id: string;
    url: string;
    name?: string;
    description?: string;
    variables?: Dictionary<INodeVariable, string>;
}
