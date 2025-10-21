import { GridCellProps } from "@progress/kendo-react-grid";
import { Tooltip } from "@progress/kendo-react-tooltip";
import React from "react";
import "./GridListCell.scss";

export const GridListCellTooltipContentTemplate = (props: { title: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined }) => {
  return (
    <div className="container">
      <ul>
        {props.title
          ?.toString()
          .split(",")
          .map((v) => {
            return <li>{v}</li>;
          })}
      </ul>
    </div>
  );
};

export const GridListCell = (props: GridCellProps) => {
  const field = props.field || "";
  const value = props.dataItem[field];
  const anchor = React.useRef<HTMLDivElement>(null);

  return (
    <Tooltip
      className="grid-list-tooltip"
      content={(props) => <GridListCellTooltipContentTemplate title={props.title} />}
      showCallout={false}
      anchorElement="target"
      targetElement={anchor.current}
      onPosition={(x) => {
        if (x.element) {
          return {
            left: x.mouseLeft - x.element.clientWidth / 2,
            top: x.mouseTop - 2,
          };
        }
        return {
          left: 0,
          top: 0,
        };
      }}
    >
      <div className="grid-list-cell" title={value} ref={anchor}>
        {value}
      </div>
    </Tooltip>
  );
};
