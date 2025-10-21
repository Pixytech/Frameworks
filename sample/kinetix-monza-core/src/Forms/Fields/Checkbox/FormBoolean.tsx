import { Field } from "@progress/kendo-react-form";
import { Checkbox, Switch, SwitchProps } from "@progress/kendo-react-inputs";
import { FC, useEffect, useRef } from "react";
import { Subscription } from "rxjs";
import { IFormFieldTemplate, IFieldTemplateContext, FormFieldLayout } from "../FormFieldLayout";
import { IFormFieldComponentProps, useCommonProperties } from "../IFormField";
import { FormBooleanField } from "./FormBooleanField";
import "./FormBoolean.scss";
export enum FormBooleanVariation {
  checkbox = "checkbox",
  switch = "switch",
}

export interface IFormBooleanProps extends SwitchProps, IFormFieldComponentProps {
  dataContext: FormBooleanField;
  variation?: FormBooleanVariation;
  onLabel?:string
  offLabel?:string
}

export const BooleanFieldTemplate: IFormFieldTemplate<FormBooleanField> = (field: FormBooleanField, context: IFieldTemplateContext): any => {
  const fieldRef = useRef(null);
  useEffect(() => {
    let subscription: Subscription | undefined;
    if (fieldRef?.current) {
      subscription = context.onInit(fieldRef);
    }
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [context]);
  return <div className="FormBoolean">
    {field.variation === FormBooleanVariation.switch? 
    <Switch name={field.name} ref={fieldRef} disabled={field.model.disabled || field.Owner?.model.disabled} required={field.model.required} readOnly={field.model.readonly || field.Owner?.model.readonly} valid={field.model.valid} {...context.others} checked={field.model.value} size={"small"} onChange={context.onChange} />:
    <Checkbox name={field.name} ref={fieldRef} disabled={field.model.disabled || field.Owner?.model.disabled} required={field.model.required} readOnly={field.model.readonly || field.Owner?.model.readonly} valid={field.model.valid} {...context.others} value={field.model.value} label={field.label} onChange={context.onChange} />
    }
  </div>
};

export const FormBoolean: FC<IFormBooleanProps> = (props: IFormBooleanProps) => {
  useCommonProperties(props, () => {
    if (props.variation) {
      props.dataContext.variation = props.variation;
    }
  });
  return props.dataContext.model.hidden ? <></> : <Field {...props} className={props.className} col={props.col} row={props.row} colSpan={props.colSpan} rowSpan={props.rowSpan} labelPosition={props.labelPosition} minLabelWidth={props.minLabelWidth} maxLabelWidth={props.maxLabelWidth} component={FormFieldLayout} style={props.style} fieldTemplate={BooleanFieldTemplate} dataContext={props.dataContext} name={props.dataContext.name} label={props.dataContext.label} validator={props.dataContext.getValidators()} />;
};
