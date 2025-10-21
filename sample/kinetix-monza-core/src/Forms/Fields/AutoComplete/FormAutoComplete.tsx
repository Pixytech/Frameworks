import "./AutoComplete.scss";
import { DropDownsPopupSettings, MultiColumnComboBoxColumn } from "@progress/kendo-react-dropdowns";
import { Field } from "@progress/kendo-react-form";
import { FC, useEffect } from "react";
import { IFormFieldTemplate, IFieldTemplateContext, FormFieldLayout } from "../FormFieldLayout";
import { IFormFieldComponentProps, useCommonProperties } from "../IFormField";
import { AutoCompleteSelection, DropDownType, FormAutoCompleteField } from "./FormAutoCompleteField";
import { Tooltip } from "@progress/kendo-react-tooltip";
import { ChipListTemplate } from "./Templates/ChipListTemplate";
import { ComboBoxTemplate } from "./Templates/ComboBoxTemplate";
import { MultiColumnComboBoxTemplate } from "./Templates/MultiColumnComboBoxTemplate";
import { ChipProps } from "@progress/kendo-react-buttons";
import { MultiSelectTemplate } from "./Templates/MultiSelectTemplate";
import { DropDownTemplate } from "./Templates/DropDownTemplate";
import { DropDownTreeTemplate } from "./Templates/DropDownTreeTemplate";
import { MultiSelectTreeTemplate } from "./Templates/MultiSelectTreeTemplate";
import { RadioButtonListTemplate } from "./Templates/RadioButtonListTemplate";

export interface IFormAutoCompleteProps extends IFormFieldComponentProps {
  dataContext: FormAutoCompleteField;
  dataset?: string;
  displayName?: string;
  popupSettings?: DropDownsPopupSettings;
  columns?: MultiColumnComboBoxColumn[];
  clearButton?: boolean;
  dropDown?: DropDownType;
  selection?: AutoCompleteSelection;

  flatListItemStyle?: (props: ChipProps) => ChipProps;
  EnableAcelerator?: boolean;
}

export interface IFormAutoCompleteChildProps {
  field: FormAutoCompleteField;
  context: IFieldTemplateContext;
}

export const AutoCompleteFieldTemplate: IFormFieldTemplate<FormAutoCompleteField> = (field: FormAutoCompleteField, context: IFieldTemplateContext): any => {
  useEffect(() => {
    console.debug(`[FormAutoComplete] useEffect triggered - dataset: ${field.dataset}, initialDataLoaded: ${field.initialDataLoaded}`);
    if (field.dataset && !field.initialDataLoaded) {
      console.debug(`[FormAutoComplete] Loading initial data for dataset: ${field.dataset}`);
      field.initialDataLoaded = true;
      field.fetachData(undefined);
    }
  }, [field.dataset]);
  const getItemsComponent = (field: FormAutoCompleteField, context: IFieldTemplateContext): any => {
    switch (field.dropDown) {
      case "MultiColumnComboBox":
        return <MultiColumnComboBoxTemplate field={field} context={context} />;
      case "DropDownList":
        return <DropDownTemplate field={field} context={context} />;
      case "RadioButtonList":
        return <RadioButtonListTemplate field={field} context={context} />;
      case "DropDownTree":
        if (field.selection == "Single") {
          return <DropDownTreeTemplate field={field} context={context} />;
        } else {
          return <MultiSelectTreeTemplate field={field} context={context} />;
        }
      case "ChipList":
        return <ChipListTemplate field={field} context={context} />;
      default:
        if (field.selection == "Single") {
          return <ComboBoxTemplate field={field} context={context} />;
        } else {
          return <MultiSelectTemplate field={field} context={context} />;
        }
    }
  };
  return (
    <Tooltip anchorElement="target" parentTitle={true} showCallout={true}>
      <div className="AutoComplete">{
        <div className={`template ${field.dropDown}`}>
          {getItemsComponent(field, context)}
          </div>
      }</div>
    </Tooltip>
  );
};

export const FormAutoComplete: FC<IFormAutoCompleteProps> = (props: IFormAutoCompleteProps) => {
  useCommonProperties(props, () => {
    if (props.displayName) {
      props.dataContext.displayName = props.displayName;
    }
    if (props.dataset) {
      props.dataContext.dataset = props.dataset;
    }

    if (props.columns) {
      props.dataContext.columns = props.columns;
    }

    if (props.dropDown) {
      props.dataContext.dropDown = props.dropDown;
    }

    props.dataContext.clearButton = props.clearButton!;

    if (props.selection) {
      props.dataContext.selection = props.selection;
    }
    if (props.EnableAcelerator) {
      props.dataContext.EnableAcelerator = props.EnableAcelerator;
    }
  });

  return props.dataContext.model.hidden ? <></> : <Field className={props.className} col={props.col} row={props.row} popupSettings={props.popupSettings} colSpan={props.colSpan} rowSpan={props.rowSpan} style={props.style} labelPosition={props.labelPosition} minLabelWidth={props.minLabelWidth} maxLabelWidth={props.maxLabelWidth} component={FormFieldLayout} fieldTemplate={AutoCompleteFieldTemplate} dataContext={props.dataContext} name={props.dataContext.name} flatListItemStyle={props.flatListItemStyle} label={props.dataContext.label} validator={props.dataContext.getValidators()} />;
};
