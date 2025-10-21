import { Field } from "@progress/kendo-react-form";
import { GridColumnProps, GridDetailRowProps } from "@progress/kendo-react-grid";
import { ComponentType, FC, useEffect, useRef } from "react";
import { FormDataGridField } from "./FormDataGridField";
import { Tooltip } from "@progress/kendo-react-tooltip";
import "./FormDataGrid.scss";

import { EXPANDED_FIELD, idGetter, SELECTED_FIELD } from "../../../Blotter/Utils/constants";
import { SelectionSettings } from "../../../Data";
import { IFormFieldTemplate, IFieldTemplateContext, FormFieldLayout } from "../FormFieldLayout";
import { IFormFieldComponentProps, useCommonProperties } from "../IFormField";
import { TreeView, TreeViewExpandChangeEvent, TreeViewProps, TreeViewItemDragStartEvent, TreeViewItemDragEndEvent, TreeViewItemDragOverEvent } from "@progress/kendo-react-treeview";
import { EditModes } from "./FormDataGrid";
import { useViewModelInstance } from "@kinetix/core";

interface IFormTreeViewProps extends IFormFieldComponentProps, TreeViewProps {
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
  showTreeLines?: boolean;
  detail?: null | ComponentType<GridDetailRowProps>;
  draggable?: boolean;
  onItemDragStart?: (event: TreeViewItemDragStartEvent) => void;
  onItemDragEnd?: (event: TreeViewItemDragEndEvent) => void;
  onItemDragOver?: (event: TreeViewItemDragOverEvent) => void;
}

export const FormTreeViewTemplate: IFormFieldTemplate<FormDataGridField> = (field: FormDataGridField, context: IFieldTemplateContext): any => {
  const fieldRef = useRef(null);
  const parentRef = useRef<HTMLDivElement>(null);
  const dataContext = useViewModelInstance(field);

  const onExpandChange = (event: TreeViewExpandChangeEvent) => {
    const fieldId = event.itemHierarchicalIndex;
    const collapsed = dataContext.model.collapsedState.find((id) => id === fieldId) != undefined;
    const collapsedIds = collapsed ? dataContext.model.collapsedState.filter((id) => id !== fieldId) : [...dataContext.model.collapsedState, fieldId];
    dataContext.updateModel((x) => (x.collapsedState = collapsedIds));
    console.debug("onExpandChange", collapsedIds);
  };

  const onCheckChange = (event: TreeViewExpandChangeEvent) => {
    const fieldId = event.itemHierarchicalIndex;
    const checked = dataContext.model.checkedState.find((id) => id === fieldId) != undefined;
    const checkedState = !checked ? [...dataContext.model.checkedState, fieldId] : dataContext.model.checkedState.filter((id) => id !== fieldId);
    dataContext.updateModel((x) => (x.checkedState = checkedState));
  };

  useEffect(() => {
    let subscription = fieldRef?.current ? context.onInit(fieldRef) : undefined;

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  });

  const loadingPanel = (
    <div className="loading-panel">
      <div className="k-loading-mask">
        <span className="k-loading-text">{}</span>
        <div className="k-loading-image"></div>
        <div className="k-loading-color"></div>
      </div>
    </div>
  );

  return (
    <div className="formDataTreeField" ref={parentRef} onFocus={(x) => field.onFocus()} onBlur={(x) => field.onLostFocus()} tabIndex={-1}>
      <Tooltip anchorElement="target" parentTitle={true}>
        <TreeView
          textField={context.others.textField || "value"}
          className={`data-tree ${context.others.showTreeLines ? "data-tree-with-lines" : ""} ${context.others.className ? context.others.className : ""}`}
          childrenField={context.others.childrenField || "items"}
          selectField={SELECTED_FIELD}
          onCheckChange={onCheckChange}
          onExpandChange={onExpandChange}
          expandField={EXPANDED_FIELD}
          expandIcons={true}
          onItemClick={(event) => {
            dataContext.raiseSelectionChange(event);
            dataContext.updateModel(
              (x) =>
                (x.selectedState = {
                  [event.itemHierarchicalIndex]: true,
                  [idGetter(event.item)]: true,
                })
            );
            if (dataContext.rowClicked) {
              dataContext.rowClicked(event.item);
              context.onChange({ value: field.model.value });
            }
          }}
          draggable={context.others.draggable}
          onItemDragStart={context.others.onItemDragStart}
          onItemDragEnd={context.others.onItemDragEnd}
          onItemDragOver={context.others.onItemDragOver}
          {...context.others}
          valid={field.model.valid}
          id={field.model.primaryKeys}
          data={field.model.getTreeDataResult().data}
        />

        {field.model.isLoading && loadingPanel}
      </Tooltip>
    </div>
  );
};

export const FormTreeView: FC<IFormTreeViewProps> = (props: IFormTreeViewProps) => {
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
  return props.dataContext.model.hidden ? <></> : <Field className={props.className} component={FormFieldLayout} fieldTemplate={FormTreeViewTemplate} name={props.dataContext.name} labelPosition={props.labelPosition} minLabelWidth={props.minLabelWidth} maxLabelWidth={props.maxLabelWidth} label={props.dataContext.label} resizable={props.resizable} validator={props.dataContext.getValidators()} {...props} />;
};
