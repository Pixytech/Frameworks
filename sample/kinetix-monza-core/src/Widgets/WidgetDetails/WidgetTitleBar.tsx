import { IHeaderTemplateProps, useViewModelInstance } from "@kinetix/core";
import { FC } from "react";
import { IBlotter } from "../../Blotter";

export const WidgetTitleBar: FC<IHeaderTemplateProps> = (
  props: IHeaderTemplateProps
) => {
  const dataContext = props.dataContext as IBlotter;
  useViewModelInstance(dataContext);

  return (
    <div>
      {props.dialogComponent.model.title}{" "}
      {dataContext && dataContext.model.totalServerCount > 0 && (
        <>({dataContext.model.totalServerCount})</>
      )}
    </div>
  );
};
