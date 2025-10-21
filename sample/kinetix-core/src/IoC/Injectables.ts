import { injectable,decorate,inject, LazyServiceIdentifier, LazyServiceIdentifer } from "inversify";
import { Token } from "../Core";


export function IocInjectable() {
    return injectable();
}

export function IocInject(serviceIdentifier: Token) {
  return inject(serviceIdentifier);
}

declare type Prototype<T> = {
  [Property in keyof T]: T[Property] extends NewableFunction ? T[Property] : T[Property] | undefined;
} & {
  constructor: NewableFunction;
};

interface ConstructorFunction<T = Record<string, unknown>> {
  new (...args: unknown[]): T;
  prototype: Prototype<T>;
}
export declare type DecoratorTarget<T = unknown> = ConstructorFunction<T> | Prototype<T>;

export function IocDecorate(
  decorator: (DecoratorTarget | ParameterDecorator | MethodDecorator),
  target: any,
  parameterIndexOrProperty?: number | string): void {
    decorate(decorator,target,parameterIndexOrProperty)
}
