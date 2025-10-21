import { CoreTypes } from "../CoreTypes";
import { Token, Type } from "../Core";
import { IViewMapProvider } from "./IViewMapProvider";
import { IViewModel } from "./IViewModel";
import { IViewResolver } from "./IViewResolver";

import { IocInject, IocInjectable } from "../IoC/Injectables";
import { IContainer } from "../IoC/IContainer";
import React from "react";

@IocInjectable()
export class ViewResolver implements IViewResolver {
  private readonly container: IContainer;

  // todo fix this and above IocInjectable
  public constructor(@IocInject(CoreTypes.IContainer) builder: any) {
    this.container = builder;
  }

  private readonly viewMap: Map<
    Type<IViewModel>,
    (vm: IViewModel, children?: React.ReactNode, props?: any) => JSX.Element
  > = new Map<
    Type<IViewModel>,
    (vm: IViewModel, children?: React.ReactNode, props?: any) => JSX.Element
  >();
  private readonly viewModelPrototypeMap: Map<any, Type<IViewModel>> = new Map<
    any,
    Type<IViewModel>
  >();
  private readonly viewModelTokenMap: Map<Type<IViewModel>, Token<IViewModel>> =
    new Map<any, Token<IViewModel>>();

  initialize(): void {
    if (this.viewMap.size === 0) {
      var providers = this.container.buildAll<IViewMapProvider>(
        CoreTypes.IViewMapProvider
      );
      providers?.forEach((viewMapProvider) => {
        viewMapProvider.provideMap(this);
      });
    }
  }

  renderInstance(
    viewModel: IViewModel,
    children?: React.ReactNode,
    props?: any
  ): JSX.Element {
    const prototype = Object.getPrototypeOf(viewModel);
    if (this.viewModelPrototypeMap.has(prototype)) {
      var viewModelType = this.viewModelPrototypeMap.get(prototype);
      if (viewModelType) {
        if (this.viewMap.has(viewModelType)) {
          var viewType = this.viewMap.get(viewModelType);
          if (viewType) {
            const view = viewType(viewModel, children, props);
            return view;
          }
        }
      }
    }
    throw Error(`Viewmodel is not registered ${prototype.constructor.name}`);
  }

  renderType<TModel extends IViewModel>(
    viewModelType: Type<TModel>,
    children?: React.ReactNode,
    props?: any
  ): JSX.Element {
    if (this.viewMap.has(viewModelType)) {
      var viewModelToken = this.viewModelTokenMap.get(viewModelType);
      if (viewModelToken) {
        var viewModel = this.container.build<TModel>(
          viewModelToken as Token<TModel>
        );
        return this.renderInstance(viewModel, children, props);
      }
    }
    throw Error(`Viewmodel is not registered for type ${viewModelType}`);
  }

  renderToken<TModel extends IViewModel>(
    viewModelToken: Token<TModel>,
    children?: React.ReactNode,
    props?: any
  ): JSX.Element {
    var viewModel = this.container.build<TModel>(viewModelToken);
    return this.renderInstance(viewModel, children, props);
  }

  //register<TView extends IView, TModel extends IViewModel>(viewType: Type<TView>, vmType: Type<TModel>, vmToken:Token<TModel>): void {
  register<TModel extends IViewModel>(
    viewFactory: (
      vm: IViewModel,
      children?: React.ReactNode,
      props?: any
    ) => JSX.Element,
    vmType: Type<TModel>
  ): void;
  register<TModel extends IViewModel>(
    viewFactory: (
      vm: IViewModel,
      children?: React.ReactNode,
      props?: any
    ) => JSX.Element,
    vmType: Type<TModel>,
    vmToken?: Token<TModel>
  ): void {
    this.viewMap.set(vmType, viewFactory);
    this.viewModelPrototypeMap.set(vmType.prototype, vmType);
    this.viewModelTokenMap.set(vmType, vmToken ? vmToken : vmType);
  }
}
