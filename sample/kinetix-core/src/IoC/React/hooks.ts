
import { useContext } from 'react';
import { IContainer } from '../IContainer';
import { IocReactContext } from './internal';

/**
 * Resolves container or something from container (if you specify resolving function)
 */
export function useContainer(): IContainer
{
    const container = useContext(IocReactContext);
    if (!container) {
        throw new Error(
            'Cannot find Inversify container on React Context. ' +
            '`Provider` component is missing in component tree.'
        );
    }
    return container;
}




