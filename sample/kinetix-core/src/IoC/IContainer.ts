import { Token, Type } from "../Core";
import { type IRegistry } from "./IRegistry";
import { ObjectLifecycle } from "./ObjectLifecycle";

export interface IContainer {
  parent: IContainer | undefined;
  /**
   * @function resolve Build an object of given token and return to the caller.
   * @param token identifier of specified type..
   * @returns {T} instance of specified type.
   */
  build<T>(token: Token<T>): T;

  /**
   * @function resolveAll Building an array of object of given token type.
   * @param token identifier of specified type.
   * @returns {Array<T>} array of instance.
   */
  buildAll<T>(token: Token<T>): T[];

  register<T>(identifier: Token<T>, type: Type<T>, dependencyLifecycle: ObjectLifecycle): IContainer;

  registerType<T>(type: Type<T>, dependencyLifecycle: ObjectLifecycle): IContainer;

  registerInstance<T>(identifier: Token<T>, instance: T): IContainer;

  includeRegistry<T extends IRegistry>(type: Type<T>): IContainer;

  createChildContainer(): IContainer;

  hasComponent<T>(componentType: Token<T>): Boolean;

  deregister<T>(identifier: Token<T>): IContainer;

  /* load(module: ContainerModule):void; */
}
