import { createContext } from 'react';
import { IContainer } from '../IContainer';


type IocReactContextValue = IContainer | undefined;
export const IocReactContext = createContext<IocReactContextValue>(undefined);
IocReactContext.displayName = 'IocReactContext';


