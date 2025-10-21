import { BooleanFilter, BooleanFilterProps, DateFilter, DateFilterProps, NumericFilter, NumericFilterProps, TextFilter, TextFilterProps } from "@progress/kendo-react-data-tools";
import { BlotterColumnDefinition } from "../../..";

import { DataFieldSettings, DataTypes, IFilterData, IListFilterDataProvider, isDataTypeNumber } from "../../../../Data";
import { useViewModelInstance } from "@kinetix/core";
import { GridColumnMenuCheckboxFilter, GridColumnMenuCheckboxFilterProps, GridColumnMenuFilter, GridColumnMenuProps, GridColumnMenuSort, GridFilterCellProps } from "@progress/kendo-react-grid";
import { DropDownList, DropDownListChangeEvent } from "@progress/kendo-react-dropdowns";
import { Button } from "@progress/kendo-react-buttons";
import { useContext } from "react";
import { BlotterContext } from "../../../BlotterContext";
import { getOperatorsByType } from "../../../Utils/Operators";
import { CompositeFilterDescriptor } from "@progress/kendo-data-query";

export const ColumnMenuFilter = (props: GridColumnMenuProps) => {
  const context = useContext(BlotterContext);
  const blotterColumn = context?.model.columns.find((x) => x.name == props.column.field);
  const type = blotterColumn?.type;
  if (type == DataTypes.enum || type == DataTypes.list) {
    return <ColumnMenuListFilter {...props} />;
  } else {
    return <ColumnMenuInBuildFilter {...props} />;
  }
};

const ColumnMenuInBuildFilter = (props: GridColumnMenuProps) => {
  const context = useContext(BlotterContext);
  
  return (
    <>
      {context?.model.sortable && <GridColumnMenuSort {...props} />}
      {<GridColumnMenuFilter expanded={true} {...props} hideSecondFilter={true} />}
    </>
  );
};

const ColumnMenuListFilter = (props: GridColumnMenuProps) => {
  const context = useContext(BlotterContext);
  const blotterColumn = context?.model.columns.find((x) => x.name === props.column.field);
  const provider = blotterColumn?.filterProvider;

  return (
    <>
      {context?.model.sortable && <GridColumnMenuSort {...props} />}
      {blotterColumn && provider && <GridColumnMenuCheckboxFilterWrapper blotterColumn={blotterColumn} provider={provider} menuProps={{ ...props, data: [] }} />}
    </>
  );
};

const GridColumnMenuCheckboxFilterWrapper = (p: { menuProps: GridColumnMenuCheckboxFilterProps; provider: IListFilterDataProvider; blotterColumn: BlotterColumnDefinition }) => {
  const dataProvider = useViewModelInstance(p.provider);
  return (
    <GridColumnMenuCheckboxFilter
      {...p.menuProps}
      data={dataProvider.model.data.map((x) => {
        return { [`${p.blotterColumn?.name}`]: x.text };
      })}
      searchBoxFilterOperator={"contains"}
      expanded={true}
    />
  );
};

export const RowListFilter = (props: GridFilterCellProps) => {
  const context = useContext(BlotterContext);

  const blotterColumn = context?.model.columns.find((x) => x.name == props.field);
  const provider = blotterColumn?.filterProvider as IListFilterDataProvider;
  const dataProvider = useViewModelInstance(provider);

  let hasValue = (value: string) => Boolean(value && value !== "");

  const onChange = (event: DropDownListChangeEvent) => {
    const value: IFilterData = event.target.value;
    const changeHasValue = hasValue(value.text);
    props.onChange({
      value: changeHasValue ? value.value : "",
      operator: changeHasValue ? "eq" : "",
      syntheticEvent: event.syntheticEvent,
    });
  };

  const onClearButtonClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    props.onChange({
      value: "",
      operator: "",
      syntheticEvent: event,
    });
  };

  return (
    <div className="k-filtercell">
      <DropDownList data={dataProvider.model.data} textField="text" dataItemKey="value" onChange={onChange} value={dataProvider.model.data.find((x) => x.value == props.value) || ""} defaultItem={""} />
      <Button title="Clear" disabled={!hasValue(props.value)} onClick={onClearButtonClick} icon="k-icon k-font  k-i-filter-clear"></Button>
    </div>
  );
};

export const FieldFilter = (props: { prop: TextFilterProps | NumericFilterProps | BooleanFilterProps | DateFilterProps; column: BlotterColumnDefinition }) => {
  if (isDataTypeNumber(props.column.type)) {
    return <NumericFilter {...props.prop} />;
  }
  if (props.column.type === DataTypes.boolean) {
    return <BooleanFilter {...props.prop} />;
  }
  if (props.column.type === DataTypes.date) {
    return <DateFilter {...props.prop} />;
  }

  if (props.column.type === DataTypes.enum || props.column.type === DataTypes.list) {
    return <EditorListFilter {...props} />;
  }

  return <TextFilter {...props.prop} />;
};

export const EditorListFilter = (props: { prop: TextFilterProps; column: BlotterColumnDefinition }) => {
  const dataProvider = useViewModelInstance(props.column.filterProvider as IListFilterDataProvider);
  return <BooleanFilter {...props.prop} data={dataProvider.model.data} />;
};

export const getFieldSettings = (column: BlotterColumnDefinition): DataFieldSettings => {
  return {
    name: column.name,
    label: column.displayName,
    type: column.type,
    filter: (props: TextFilterProps) => {
      return <FieldFilter prop={props} column={column} />;
    },
    operators: getOperatorsByType(column.type),
  };
};
