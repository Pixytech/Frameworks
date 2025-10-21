import { GridLayoutItem } from "@progress/kendo-react-layout";
import { Tooltip } from "@progress/kendo-react-tooltip";
import { FC, ReactNode } from "react";

interface IFormCardrProps {
  title?: string | ReactNode;
  colSpan?: number;
  col?: number;
  row?: number;
  rowSpan?: number;
  children?: any;
}

const FormCardContent: FC<IFormCardrProps> = (props: IFormCardrProps) => {
  return (
    <Tooltip anchorElement="target" parentTitle={true}>
    <div className="section-container form-card">
      {props.title && <div className="formTitle">{props.title}</div>}
      <div className="field-group"> {props.children} </div>
    </div>
    </Tooltip>
  );
};
export const FormCard: FC<IFormCardrProps> = (props: IFormCardrProps) => {
  return props.colSpan || props.rowSpan || props.col || props.row || props.title ? (
    <GridLayoutItem colSpan={props.colSpan} rowSpan={props.rowSpan} col={props.col} row={props.row}>
      <FormCardContent {...props} />
    </GridLayoutItem>
  ) : (
    <FormCardContent {...props} />
  );
};
