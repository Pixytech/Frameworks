import * as React from "react";
import { useContext, useState } from "react";
import { IContainer } from "../IContainer";
import { IocReactContext } from "./internal";
import { IocProviderProps } from "./IocProviderProps";

// very basic typeguard, but should be enough for local usage
function isContainer(x: IocProviderProps["container"]): x is IContainer {
  return "resolve" in x;
}

export const IoCProvider: React.FC<IocProviderProps> = ({
  children,
  container: containerProp,
  standalone: standaloneProp = false,
}) => {
  // #DX: guard against `container` prop change and warn with explicit error
  const [container] = useState(containerProp);
  // ...but only if it's an actual Container and not a factory function (factory can be a new function on each render)
  if (isContainer(containerProp) && containerProp !== container) {
    throw new Error(
      "Changing `container` prop (swapping container in runtime) is not supported.\n" +
        "If you're rendering Provider in some list, try adding `key={container.id}` to the Provider.\n" +
        "More info on React lists:\n" +
        "https://reactjs.org/docs/lists-and-keys.html#keys\n" +
        "https://reactjs.org/docs/reconciliation.html#recursing-on-children"
    );
  }

  // #DX: guard against `standalone` prop change and warn with explicit error
  const [standalone] = useState(standaloneProp);
  if (standaloneProp !== standalone) {
    throw new Error(
      "Changing `standalone` prop is not supported." // ...does it make any sense to change it?
    );
  }

  // we bind our container to parent container BEFORE first render,
  // so that children would be able to resolve stuff from parent containers
  const parentContainer = useContext(IocReactContext);
  useState(function prepareContainer() {
    if (!standalone && parentContainer) {
      if (parentContainer === container) {
        throw new Error(
          "Provider has found a parent container (on surrounding React Context), " +
            "yet somehow it's the same as container specified in props. It doesn't make sense.\n" +
            "Perhaps you meant to configure Provider as standalone={true} ?"
        );
      }
      if (container.parent) {
        throw new Error(
          "Ambiguous containers hierarchy.\n" +
            "Provider has found a parent for specified `container`, but it already has a parent.\n"
          // It is likely one of two:
          //
          // 1) If existing `container.parent` is not an accident (e.g. you already control hierarchy),
          //    then you should use `standalone` configuration
          //    <Provider container={myContainer} standalone={true}>
          //    so that Provider won't try to set parent container (found on React Context)
          //
          // 2) Perhaps existing `container.parent` is an accident (???)
          //    and you actually would rather want to use container from surrounding React Context as parent,
          //    then you unset `container.parent` first.
          //
          // More info on hierarchical DI:
          // https://github.com/inversify/InversifyJS/blob/master/wiki/hierarchical_di.md'
        );
      }

      container.parent = parentContainer;
    }
  });

  return (
    <IocReactContext.Provider value={container}>
      {children}
    </IocReactContext.Provider>
  );
};
