import React from "react";

import { IViewModel, IViewResolver } from "../Mvvm";
import { omit } from "lodash";
import { Token } from "../Core";
import { CoreTypes } from "../CoreTypes";
import { useContainer } from "../IoC";
import { ComponentBoundary } from "./ComponentBoundary";

export type RegionViewProps = Readonly<{
  type?: Token<IViewModel>;
  viewModel?: IViewModel | null;
  children?: React.ReactNode;

  [customProp: string]: any;
}>;

export function RegionView(props: RegionViewProps) {
  const container = useContainer();
  const viewResolver = container.build<IViewResolver>(CoreTypes.IViewResolver);
  const renderer = (data: RegionViewProps): JSX.Element => {
    return (
      <ComponentBoundary>
        {(() => {
          const otherProps = omit({ ...data }, ["type", "viewModel", "children"]);
          if (data.type) {
            return viewResolver.renderToken(data.type, props.children, otherProps);
          } else if (data.viewModel) {
            return viewResolver.renderInstance(data.viewModel, props.children, otherProps);
          } else {
            console.error("Please provide either view type or view model instance");
            return <div>Under construction</div>;
          }
        })()}
      </ComponentBoundary>
    );
  };

  return renderer(props);
}
