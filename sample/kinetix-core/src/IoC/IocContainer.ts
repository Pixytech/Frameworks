import { Container } from "inversify";
import { Token, Type, TypeDescriptor } from "../Core";
import { CoreTypes } from "../CoreTypes";
import { IContainer } from "./IContainer";
import { IocInjectable } from "./Injectables";
import { IRegistry } from "./IRegistry";
import { ObjectLifecycle } from "./ObjectLifecycle";

@IocInjectable()
export class IocContainer implements IContainer {
  container: Container;
  parent: IContainer | undefined;
  private registry: any[] = [];
  constructor(container: Container | undefined = undefined) {
    console.debug("Creating Ioc Container");
    if (container === undefined) {
      this.container = new Container();
    } else {
      this.container = container;
    }

    this.registerInstance(CoreTypes.IContainer, this);
  }

  includeRegistry<T extends IRegistry>(type: Type<T>): IContainer {
    if (!this.registry.includes(type)) {
      this.registry.push(type);
      var registry = TypeDescriptor.create(type);
      registry.configure(this);
    }
    return this;
  }

  register<T>(identifier: Token<T>, type: Type<T>, dependencyLifecycle: ObjectLifecycle): IContainer {
    return this.registerInternal(identifier, type, dependencyLifecycle);
  }

  deregister<T>(identifier: Token<T>): IContainer {
    if (this.hasComponent(identifier)) {
      this.container.unbind(identifier);
    }
    return this;
  }

  registerType<T>(type: Type<T>, dependencyLifecycle: ObjectLifecycle): IContainer {
    return this.registerInternal(type, type, dependencyLifecycle);
  }

  registerInternal<T>(identifier: Token<T>, type: Type<T>, dependencyLifecycle: ObjectLifecycle): IContainer {
    if (dependencyLifecycle === ObjectLifecycle.Singleton) {
      this.container.bind(identifier).to(type).inSingletonScope();
    } else {
      this.container.bind(identifier).to(type).inTransientScope();
    }

    return this;
  }

  registerInstance<T>(identifier: Token<T>, instance: T): IContainer {
    this.container.bind(identifier).toConstantValue(instance);
    return this;
  }

  build<T>(token: Token<T>): T {
    return this.container.get<T>(token);
  }
  buildAll<T>(token: Token<T>): T[] {
    return this.container.getAll(token);
  }

  hasComponent<T>(componentType: Token<T>): Boolean {
    return this.container.isBound(componentType);
  }

  private createChild(childContainer: Container): IocContainer {
    const ob = new IocContainer(childContainer);

    ob.parent = this;
    return ob;
  }

  createChildContainer(): IContainer {
    const childContainer: Container = this.container.createChild();
    return this.createChild(childContainer);
  }
}
