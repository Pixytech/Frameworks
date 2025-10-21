import { GridCellProps, GridRowProps } from "@progress/kendo-react-grid";

import * as React from "react";
import { ReactNode } from "react";

interface CellRenderProps {
  originalProps: GridCellProps;
  td: React.ReactElement<HTMLTableCellElement>;
  enterEdit: (dataItem: any, fieldName: string | undefined) => void;
  editField: string | undefined;
}

interface RowRenderProps {
  originalProps: GridRowProps;
  tr: React.ReactElement<HTMLTableRowElement>;
  exitEdit: () => void;
  editField: string | undefined;
}

export const CellRender = (cellRenderProps: CellRenderProps) => {
  const dataItem = cellRenderProps.originalProps.dataItem;
  const cellField = cellRenderProps.originalProps.field;
  const inEditField = dataItem[cellRenderProps.editField || ""];
  const value = `${dataItem[cellField || ""]}`;

  const additionalProps =
    cellField && cellField === inEditField
      ? {
          ref: (td: any) => {
            const input = td && td.querySelector("input");
            const activeElement = document.activeElement;

            if (!input || !activeElement || input === activeElement || !activeElement.contains(input)) {
              return;
            }

            if (input.type === "checkbox") {
              input.focus();
            } else {
              input.select();
            }
          },
        }
      : {
          onClick: () => {
            cellRenderProps.enterEdit(dataItem, cellField);
          },
          title: value,
        };

  const clonedProps: any = { ...(cellRenderProps.td ? cellRenderProps.td.props : []), ...additionalProps };
  return React.cloneElement(cellRenderProps.td ? cellRenderProps.td : <></>, clonedProps, cellRenderProps.td ? (cellRenderProps.td.props.children as unknown as ReactNode[]) : []);
};

export const RowRender = (rowRenderProps: RowRenderProps) => {
  const trProps = {
    ...rowRenderProps.tr.props,
    onBlur: () => {
      rowRenderProps.exitEdit();
    },
  };
  return React.cloneElement(rowRenderProps.tr, { ...trProps }, rowRenderProps.tr?.props.children as unknown as ReactNode[]);
};
