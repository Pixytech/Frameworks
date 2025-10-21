import { Field } from "@progress/kendo-react-form";
import { CellRender, RowRender } from "./renderers";
import { Grid, GridColumn, GridColumnProps, GridRowClickEvent, GridDetailRowProps, GridRowProps, GridCellProps, GridProps } from "@progress/kendo-react-grid";
import { ComponentType, FC, useEffect, useRef } from "react";
import { FormDataGridField } from "./FormDataGridField";
import { Tooltip } from "@progress/kendo-react-tooltip";
import "./FormDataGrid.scss";

import { DATA_ITEM_KEY, EDIT_FIELD, EXPANDED_FIELD, EXPANDED_ROW, SELECTED_FIELD } from "../../../Blotter/Utils/constants";
import { SelectionSettings } from "../../../Data";
import { IFormFieldTemplate, IFieldTemplateContext, FormFieldLayout } from "../FormFieldLayout";
import { IFormFieldComponentProps, useCommonProperties } from "../IFormField";

export enum EditModes {
  InCell,
  InLine,
  AlwaysEditable,
}
interface IFormDataGridProps extends  IFormFieldComponentProps, GridProps  {
  dataContext: FormDataGridField;
  selectionSettings?: Partial<SelectionSettings>;
  columns?: GridColumnProps[];
  resizable?: boolean;
  primaryKeys?: string[];
  editMode?: EditModes;
  editable?: boolean;
  pageable?: boolean;
  pageSize?: number;
  disableSort?: boolean;
  detail?: null | ComponentType<GridDetailRowProps>;
}

export const DataGridFieldFieldTemplate: IFormFieldTemplate<FormDataGridField> = (field: FormDataGridField, context: IFieldTemplateContext): any => {
  const fieldRef = useRef(null);
  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let subscription = fieldRef?.current ? context.onInit(fieldRef) : undefined;

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  });

  
  const DragCell = (props: GridCellProps) => {
    return (
      <td
        onDrop={(e) => {
          field.draggable.dragEnd();
          e.preventDefault();
        }}
        onDragOver={(e) => {
          field.draggable.reorder(props.dataItem);
          e.preventDefault();
          e.dataTransfer.dropEffect = "copy";
        }}
      >
        <span
          className="k-icon k-font-icon k-i-reorder"
          draggable={field.draggable.enable}
          style={{ cursor: "move" }}
          onDragStart={(e) => {
            field.draggable.activeDragItem = props.dataItem;
            e.dataTransfer.setData("dragging", "");
          }}
        />
      </td>
    );
  };

  
  const getGridClassNames = () => {
    
      if (field.model.state.skip && field.model.state.take) {
        let pageIndex = field.model.state.skip / field.model.state.take;
        // let hidePagerNumbers = pageIndex >= 10;
        let hidePagerNumbers = false;

        return `${context.others.className} blotter-grid-server ${hidePagerNumbers ? "blotter-grid-hide-pager-numbers" : ""}`;
      }
    

    return "blotter-grid-server";
  };

  const customRowRender: any = (tr: React.ReactElement<HTMLTableRowElement>, props: GridRowProps) => <RowRender originalProps={props} tr={tr} exitEdit={field.exitEdit} editField={EDIT_FIELD} />;
  const loadingPanel = (
    <div className="loading-panel">
      <div className="k-loading-mask">
        <span className="k-loading-text">{}</span>
        <div className="k-loading-image"></div>
        <div className="k-loading-color"></div>
      </div>
    </div>
  );
  const customCellRender: any = (td: React.ReactElement<HTMLTableCellElement>, props: GridCellProps) => <CellRender originalProps={props} td={td} enterEdit={field.enterEdit} editField={EDIT_FIELD} />;
  const usefillColumn = field.columns?.some((x) => x.width == undefined);
  return (
    <div className="formDataGridField" ref={parentRef} onFocus={x=>field.onFocus()} onBlur={x=>field.onLostFocus()} tabIndex={-1}>
      <Tooltip anchorElement="target" parentTitle={true}>
        <Grid
          name={field.name}
          
          rowRender={customRowRender}
          cellRender={customCellRender}
          ref={fieldRef}
          pageable
          className={getGridClassNames()}
          valid={field.model.valid}
          id={field.model.primaryKeys}
          data={field.model.getDataResult()}
          {...context.others}
          editField={context.others.editable ? EDIT_FIELD : undefined}
          dataItemKey={DATA_ITEM_KEY}
          expandField={context.others.detailView ? EXPANDED_ROW : EXPANDED_FIELD}
          selectedField={SELECTED_FIELD}
          onExpandChange={field.expandChange}
          sortable={!context.others.disableSort && {
            allowUnsort: true,
            mode: "single",
          }}
          onDataStateChange={async (e) => await field.dataStateChange(e.dataState)}
          onSortChange={(e) => field.updateModel((x) => (x.state = { ...x.state, sort: e.sort }))}
          onItemChange={context.others.editable ? (e) => field.itemChange(e.field, e.dataItem, e.value) : undefined}
          onRowClick={(e: GridRowClickEvent) => {
            field.rowClicked(e.dataItem);
            context.onChange({value:field.model.value});
          }}
          resizable={context.others.resizable}
          label={undefined}
          selectable={{
            enabled: field.selectionSettings.enabled,
            cell: field.selectionSettings.cell,
            drag: field.selectionSettings.drag,
            mode: field.selectionSettings.mode,
          }}
          onHeaderSelectionChange={x=>{
            field.headerSelectionChange(x);
            context.onChange({value:field.model.value});
          }}
          onSelectionChange={x=>{
            field.selectionChange(x);
            context.onChange({value:field.model.value});
          }}
          
          onChange={context.onChange}
          {...field.model.state}
        >
          {field.draggable && <GridColumn title="" width="40px" cell={DragCell} /> }
          {field.selectionSettings.headerSelection && <GridColumn field={SELECTED_FIELD}  orderIndex={0} width="44px" />}
          {field.columns?.map((column: GridColumnProps) => (
            <GridColumn key={`${column.field}`} {...column} width={column.width} editable={!(field.model.readonly || field.Owner?.model.readonly) && column.editable} />
          ))}
          {!usefillColumn && <GridColumn key={`fillspaceColumn`} orderIndex={field.columns?.length | (0 + 10)} />}
          {context.others.children}
        </Grid>
        {field.model.isLoading && loadingPanel}
      </Tooltip>
    </div>
  );
};

export const FormDataGrid: FC<IFormDataGridProps> = (props: IFormDataGridProps) => {
  useCommonProperties(props, () => {
    if (props.columns) {
      props.dataContext.columns = props.columns;
    }

    if (props.primaryKeys) {
      props.dataContext.model.primaryKeys = props.primaryKeys;
    }

    if (props.columns) {
      props.dataContext.columns = props.columns;
    }

    if (props.selectionSettings) {
      props.dataContext.selectionSettings = { ...props.dataContext.selectionSettings, ...props.selectionSettings };
    }
  });
  return props.dataContext.model.hidden ? <></> : <Field className={props.className} component={FormFieldLayout} fieldTemplate={DataGridFieldFieldTemplate} name={props.dataContext.name} labelPosition={props.labelPosition} minLabelWidth={props.minLabelWidth} maxLabelWidth={props.maxLabelWidth} label={props.dataContext.label} resizable={props.resizable} validator={props.dataContext.getValidators()} {...props} />;
};
