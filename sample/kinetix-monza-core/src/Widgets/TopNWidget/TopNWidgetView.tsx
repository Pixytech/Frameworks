import { useViewModelInstance } from "@kinetix/core";
import { FC } from "react";
import { ProgressBar } from "@progress/kendo-react-progressbars";
import { ITopNWidget } from "./ITopNWidget";
import "./TopNWidgetViewStyles.scss";
import { Loader } from "@progress/kendo-react-indicators";
import {
  Grid,
  GridCellProps,
  GridColumn,
  GRID_COL_INDEX_ATTRIBUTE,
} from "@progress/kendo-react-grid";
import { useTableKeyboardNavigation } from "@progress/kendo-react-data-tools";
import { Tooltip } from "@progress/kendo-react-tooltip";

export interface ITopNWidgetViewProps {
  viewModel: ITopNWidget;
}

function numFormatter(num: number) {
  let min = 1000;
  // Alter numbers larger than 1k
  if (num >= min) {
    var units = ["k", "M", "Bn", "T"];

    var order = Math.floor(Math.log(num) / Math.log(1000));

    var unitname = units[order - 1];
    var num = Number(num / 1000 ** order);

    // output number remainder + unitname
    return num.toFixed(2) + unitname;
  }

  // return formatted original number
  return num.toString();
}

const AmountCell = (props: GridCellProps) => {
  const field = props.field || "";
  const value = props.dataItem[field];
  const navigationAttributes = useTableKeyboardNavigation(props.id);

  return (
    <td
      colSpan={props.colSpan}
      role={"gridcell"}
      aria-colindex={props.ariaColumnIndex}
      aria-selected={props.isSelected}
      {...{ [GRID_COL_INDEX_ATTRIBUTE]: props.columnIndex }}
      {...navigationAttributes}
      style={{ color: "#41D0AC", textAlign: "right" }}
    >
      {value && !Number.isNaN(value) && numFormatter(Number.parseFloat(value))}
    </td>
  );
};

const NameCell = (props: GridCellProps) => {
  const field = props.field || "";
  const value = props.dataItem[field];
  const navigationAttributes = useTableKeyboardNavigation(props.id);
  return (
    <td
      colSpan={props.colSpan}
      role={"gridcell"}
      aria-colindex={props.ariaColumnIndex}
      aria-selected={props.isSelected}
      {...{ [GRID_COL_INDEX_ATTRIBUTE]: props.columnIndex }}
      {...navigationAttributes}
      title={value}
    >
      {value}
    </td>
  );
};

export const TopNWidgetView: FC<ITopNWidgetViewProps> = (props) => {
  const vm = useViewModelInstance(props.viewModel);
  let position = 1;
  const total = vm.model.items.reduce(
    (partialSum, a) => partialSum + a.value,
    0
  );

  const ProgressCell = (props: GridCellProps) => {
    const field = props.field || "";
    const value = props.dataItem[field];
    const navigationAttributes = useTableKeyboardNavigation(props.id);

    return (
      <td
        colSpan={props.colSpan}
        role={"gridcell"}
        aria-colindex={props.ariaColumnIndex}
        aria-selected={props.isSelected}
        {...{ [GRID_COL_INDEX_ATTRIBUTE]: props.columnIndex }}
        {...navigationAttributes}
      >
        {value && (
          <ProgressBar
            className="progress"
            value={(value / total!) * 100}
            labelVisible={false}
          />
        )}
      </td>
    );
  };

  return (
    <div className="kx-widget kx-top-n-widget">
      {vm.model.isLoading && vm.model.isFirstRender ? (
        <Loader />
      ) : (
        <Tooltip anchorElement="target">
          <Grid
            data={vm.model.items}
            onRowClick={(event) => vm.showDetails(event.dataItem)}
          >
            <GridColumn field="position" title="#" width="40px" />
            <GridColumn
              field="key"
              title={vm.itemColumnDisplayName}
              width="180px"
              cell={NameCell}
            />
            <GridColumn
              field="value"
              title={vm.valueColumnDisplayName}
              width="90px"
              cell={AmountCell}
            />
            <GridColumn field="value" title={" "} cell={ProgressCell} />
          </Grid>
        </Tooltip>
      )}
    </div>
  );
};
