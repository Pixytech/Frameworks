import React, { useEffect, useState } from "react";
import { IViewModelBase, IPropertyChanged, INavigationAware } from "@mlp/core";

export function useViewModel<TModel, TViewModel extends IViewModelBase<TModel>>(instance: TViewModel): TViewModel {
  const dataContext = instance;

  const [, setState] = React.useState({});

  React.useEffect(() => {
    const changeSubscription = dataContext.onModelChanged.subscribe(() => {
      console.log('Model changed', dataContext.model);
      setState({});
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
  }, [dataContext]);

  return dataContext;
}

/**
 * Hook that only initializes the ViewModel without subscribing to model changes.
 * Use this when you want to use ReactiveComponent for selective rendering.
 */
export function useViewModelInit<TModel, TViewModel extends IViewModelBase<TModel>>(instance: TViewModel): TViewModel {
  const dataContext = instance;

  React.useEffect(() => {
    (async () => {
      await dataContext.initialize();
    })();

    return () => {
      (async () => {
        await dataContext.cleanup();
      })();
    };
  }, [dataContext]);

  return dataContext;
}

export function useViewModelWithNavigation<TModel, TViewModel extends IViewModelBase<TModel> & INavigationAware>(
  instance: TViewModel,
  navigationProps: {
    queryParams?: Readonly<Record<string, string | undefined>>;
    navigator?: (to: string) => void;
    location?: any;
  }
): TViewModel {
  const dataContext = useViewModel(instance);

  React.useEffect(() => {
    if (navigationProps.queryParams) {
      dataContext.queryParams = navigationProps.queryParams;
    }
    if (navigationProps.navigator) {
      dataContext.navigator = navigationProps.navigator;
    }
    if (navigationProps.location) {
      dataContext.location = navigationProps.location;
    }
  }, [navigationProps.queryParams, navigationProps.navigator, navigationProps.location]);

  return dataContext;
}
