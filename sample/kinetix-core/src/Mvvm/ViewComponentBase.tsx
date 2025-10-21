import React from "react";
import { useLocationNoUpdates, useNavigateNoUpdates, useParamsNoUpdates } from "../Components/NavigationService/NaviationHooks";
import { Token } from "../Core";
import { useContainer } from "../IoC";
import { INavigationAware, IViewModel, IViewModelBase } from "./IViewModel";
import { DispatchState } from "./DispatchState";
import { debounceTime } from "rxjs";

export interface ViewComponentBaseProps<TViewModel> {
  dataContext: TViewModel;
}

export interface IView {
  dataContext: IViewModel;
}

export abstract class ViewComponentBase<TModel, TViewModel extends IViewModelBase<TModel>> extends React.PureComponent<ViewComponentBaseProps<TViewModel>> implements IView {
  dataContext: TViewModel;
  private changeSubscription: any;

  constructor(props: ViewComponentBaseProps<TViewModel>) {
    super(props);
    this.dataContext = props.dataContext;
  }

  async componentDidMount() {
    DispatchState(this.setState, this.dataContext.model as any);
    this.changeSubscription = this.dataContext.onModelChanged.pipe(
      debounceTime(100)).subscribe((s) => {
      DispatchState(this.setState, s as any);
    });
    await this.dataContext.initialize();
  }

  async componentDidUnMount() {
    await this.dataContext.cleanup();
    this.changeSubscription.unsubscribe();
  }
}

export function useViewModel<TModel, TViewModel extends IViewModelBase<TModel>>(token: Token<TViewModel>): TViewModel {
  const container = useContainer();
  const dataContext = container.build<TViewModel>(token);
  return useViewModelInstance(dataContext);
}

export function getNavigationAware(instance: any): INavigationAware | null {
  try {
    const assume = instance as any as INavigationAware;
    // check if both property exists on viewmodel
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const queryParam = assume.QueryParams;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const navigator = assume.navigator;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const location = assume.location;

    //get(dataContext,"QueryParams","")!=="" && get(dataContext,"navigator","")!==""
    return instance as INavigationAware;
  } catch (e) { }

  return null;
}

export function useViewModelInstance<TModel, TViewModel extends IViewModelBase<TModel>>(instance: TViewModel): TViewModel {
  const dataContext = instance;
  const state = dataContext.model;
  const [_, setState] = React.useState(state);
  const navigator = useNavigateNoUpdates();
  const params = useParamsNoUpdates();
  const location = useLocationNoUpdates();

  React.useEffect(() => {
    const navigationAware = getNavigationAware(dataContext);
    if (navigationAware) {
      navigationAware.QueryParams = params;
      navigationAware.navigator = navigator;
      navigationAware.location = location;
    }

    const changeSubscription = dataContext.onModelChanged.subscribe((s) => {
      DispatchState(setState, s);
    });

    (async () => {
      await dataContext.initialize();
    })();
    return () => {
      (async () => {
        await dataContext.cleanup();
      })();
      changeSubscription.unsubscribe();
    };
  }, [dataContext, dataContext.onModelChanged, navigator, location, params]);
  return dataContext;
}
