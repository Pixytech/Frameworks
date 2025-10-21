import { type IContainer } from "./IContainer";

/**
 * @interface IRegistry Allows to Register token for Container.
 */
 export interface IRegistry {
    /**
     * Configure types for IOC container
     * @param configurer instance of Cnfigure Component
     */
    configure(configurer: IContainer): void;
  }