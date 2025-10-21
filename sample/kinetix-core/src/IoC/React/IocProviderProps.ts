import * as React from 'react';
import { IContainer } from '../IContainer';


export type IocProviderProps = Readonly<{
    // Inversify container (or container factory) to be used for that React subtree (children of Provider)
    container: IContainer | (() => IContainer);

    // Hierarchical DI configuration:
    // standalone Provider will keep container isolated,
    // otherwise (default behavior) it will try to find parent container in React tree
    // and establish hierarchy of containers
    // @see https://github.com/inversify/InversifyJS/blob/master/wiki/hierarchical_di.md
    standalone?: boolean;

    children?: React.ReactNode;

}>;
