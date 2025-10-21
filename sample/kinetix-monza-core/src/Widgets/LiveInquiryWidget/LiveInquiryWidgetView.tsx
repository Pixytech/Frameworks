import { useViewModelInstance, Countdown } from "@kinetix/core";
import { useTableKeyboardNavigation } from "@progress/kendo-react-data-tools";
import {
  Grid,
  GridCellProps,
  GridColumn,
  GridNoRecords,
  GRID_COL_INDEX_ATTRIBUTE,
} from "@progress/kendo-react-grid";
import { Loader } from "@progress/kendo-react-indicators";
import { FC } from "react";
import { AssetType } from "../../AssetType";
import { RecordType } from "../../RecordType";
import { ILiveInquiryWidget } from "./ILiveInquiryWidget";
import React from "react";
import "./LiveInquiryWidgetViewStyles.scss";

export interface ILiveInquiryWidgetViewProps {
  viewModel: ILiveInquiryWidget;
}

const TimerCell = (props: GridCellProps) => {
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
      {value && <Countdown targetDate={new Date(value)} />}
    </td>
  );
};

/*
TODO : Commented un-used code
const DirectionCell = (props: GridCellProps) => {
  const field = props.field || "";
  const value = props.dataItem[field];
  const navigationAttributes = useTableKeyboardNavigation(props.id);
  return (
    <td
      style={{ color: value === "BUY" ? "#41D0AC" : "#F8475C" }}
      colSpan={props.colSpan}
      role={"gridcell"}
      aria-colindex={props.ariaColumnIndex}
      aria-selected={props.isSelected}
      {...{ [GRID_COL_INDEX_ATTRIBUTE]: props.columnIndex }}
      {...navigationAttributes}
    >
      {value}
    </td>
  );
};

const AmountCell = (props: GridCellProps) => {
  const field = props.field || "";
  const value = props.dataItem[field];
  const navigationAttributes = useTableKeyboardNavigation(props.id);
  return (
    <td
      style={{ textAlign: "right" }}
      colSpan={props.colSpan}
      role={"gridcell"}
      aria-colindex={props.ariaColumnIndex}
      aria-selected={props.isSelected}
      {...{ [GRID_COL_INDEX_ATTRIBUTE]: props.columnIndex }}
      {...navigationAttributes}
    >
      {value}
    </td>
  );
};*/

export const LiveInquiryWidgetView: FC<ILiveInquiryWidgetViewProps> = (
  props
) => {
  const vm = useViewModelInstance(props.viewModel);
  React.useEffect(() => {
    console.table(vm.model.items);
  });

  return (
    <div
      className={`kx-widget kx-live-inquiry-widget ${
        vm.model.isLoading || vm.model.isFirstRender ? "loading" : ""
      }`}
    >
      {vm.model.isLoading || vm.model.isFirstRender ? (
        <Loader />
      ) : (
        <Grid
          data={vm.model.items}
          onRowDoubleClick={(e) => {
            const id: string = e.dataItem.id;
            const assetType: AssetType = e.dataItem.assetClass;
            const recordType: RecordType = e.dataItem.recordType;
            vm.onRowDoubleClick(id, assetType, recordType);
          }}
        >
          <GridColumn
            field="msgTimeout"
            title="Timer"
            width="90px"
            cell={TimerCell}
          />
          <GridColumn field="leg" title="Leg" width="50px" />
          <GridColumn field="direction" title="Direction" width="90px" />
          <GridColumn
            field="quantity"
            title="Quantity"
            width="110px"
            format="{0:n}"
            className="amount-col"
          />
          <GridColumn field="quote" title="Quote" width="100px" />
          <GridColumn field="legalEntity" title="Counterparty" width="200px" />
          <GridColumn field="cusip" title="Cusip" width="150px" />
          <GridColumn field="sourceId" title="Source Id" width="150px" />
          <GridColumn field="venue" title="Venue" width="110px" />
          <GridColumn field="instrumentDesc" title="Security" width="150px" />
        </Grid>
      )}
    </div>
  );
};
