
import { Token, Type } from "../Core";
import { IViewModel } from "./IViewModel";
export interface IViewResolver {
  initialize(): void;
  renderInstance(
    viewModel: IViewModel,
    children?: React.ReactNode,
    props?: any
  ): JSX.Element;
  renderType<TModel extends IViewModel>(
    vmType: Type<TModel>,
    children?: React.ReactNode
  ): JSX.Element;
  renderToken<TModel extends IViewModel>(
    vmToken: Token<TModel>,
    children?: React.ReactNode,
    props?: any
  ): JSX.Element;

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
    vmToken: Token<TModel>
  ): void;
}
