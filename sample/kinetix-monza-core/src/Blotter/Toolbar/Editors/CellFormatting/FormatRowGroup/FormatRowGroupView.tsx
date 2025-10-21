import { AutomationHelper, RegionView, useViewModelInstance } from "@kinetix/core";
import { FilterOperator } from "@progress/kendo-react-data-tools";

import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ComboBox, DropDownList } from "@progress/kendo-react-dropdowns";
import { Input, NumericTextBox } from "@progress/kendo-react-inputs";
import { BlotterColumnDefinition } from "../../../..";
import { DataTypes, isDataTypeNumber } from "../../../../../Data";
import { IBlotterCellFormatCondition } from "../../../../BlotterConfiguration";
import { getOperatorsByType } from "../../../../Utils/Operators";
import CloseIcon from "../../../../../resources/images/Close.svg";
import "./FormatRowGroupViewStyles.scss";
import { IBlotterCellFormatRowGroup } from "./ICellFormatRowGroup";
import { Helpers } from "../../../../../Utils/Helpers";
import { isDate } from "lodash";

export interface IBlotterCellFormatRowGroupProps {
  dataContext: IBlotterCellFormatRowGroup;
}

export const BlotterCellFormatRowGroupView = (props: IBlotterCellFormatRowGroupProps) => {
  const vm = useViewModelInstance(props.dataContext);

  const getFilterOperator = (field: string, operator: string | Function): FilterOperator => {
    const column = vm.columns.find((col) => col.name === field);
    const operators = getOperatorsByType(column?.type!);
    return operators.find((op) => op.operator === operator)!;
  };

  const getValueComponent = (column: BlotterColumnDefinition, row: IBlotterCellFormatCondition, currentRowIndex: number) => {
    if (column.type === DataTypes.enum) {
      return <ComboBox allowCustom={true} data={column.possibleValues} dataItemKey="value" textField="displayName" value={row.value} onChange={(e) => vm.handleValueChange(e.value, currentRowIndex)} />;
    }

    if (column.type === DataTypes.date) {
      return <DatePicker value={isDate(row.value) ? row.value : row.value? Helpers.parseDate(row.value):null} onChange={(e) => vm.handleValueChange(e.value, currentRowIndex)} />;
    }

    if (isDataTypeNumber(column.type)) {
      return <NumericTextBox value={row.value} onChange={(e) => vm.handleValueChange(e.value, currentRowIndex)} />;
    }
    return <Input value={row.value} onChange={(e) => vm.handleValueChange(e.value, currentRowIndex)} />;
  };

  return (
    <>
      {vm.model.format && vm.model.format.conditions?.length > 0 && (
        <div className="format-group">
          <div className="column-name">{vm.model.format.column.displayName}</div>
          {vm.model.format.conditions.map((row, index, list) => {
            return (
              <div className="row" key={index}>
                <div className="operators" role="select" data-automationid={AutomationHelper.GetId("operators")}>
                  <DropDownList data={getOperatorsByType(vm.model.format.column.type)} textField="message" value={getFilterOperator(vm.model.format.column.name, row.opretaor.operator)} onChange={(e) => vm.handleOperatorChange(e.value, index)} />
                </div>
                <div className="value" data-automationid={AutomationHelper.GetId("value")}>
                  {getValueComponent(vm.model.format.column, row, index)}
                </div>
                <RegionView viewModel={vm.createFormatOptionsPopup(row)} />
                <img className="delete-row" src={CloseIcon} title="Delete" onClick={() => vm.handleDeleteRow(index)} />
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};
