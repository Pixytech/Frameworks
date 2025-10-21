import { Field } from "@progress/kendo-react-form";
import { FC, useEffect, useRef } from "react";
import { Subscription } from "rxjs";
import { IFormFieldTemplate, IFieldTemplateContext, FormFieldLayout } from "../FormFieldLayout";
import { IFormFieldComponentProps, useCommonProperties } from "../IFormField";
import { FormLabelField } from "./FormLabelField";
import { Label, LabelProps } from "@progress/kendo-react-labels";

export interface IFormLabelProps extends IFormFieldComponentProps, Omit<LabelProps, "label"> {
  dataContext: FormLabelField<any>;
}

export const LabelFieldTemplate: IFormFieldTemplate<FormLabelField<any>> = (field: FormLabelField<any>, context: IFieldTemplateContext): any => {
  const fieldRef = useRef(null);
  const { dataContext, hideDisabled, value, validationMessage, touched, modified, visited, valid, required, allowEmpty, readonly, hidden, customValidation, ...labelProps } = context.others;
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
  return <Label name={field.name} {...labelProps} title={field.showTooltip ? `${field.model.value}` : undefined} ref={fieldRef} disabled={field.model.disabled || field.Owner?.model.disabled || field.model.readonly || field.Owner?.model.readonly} required={field.model.required} valid={field.model.valid} value={field.model.value} placeholder={field.placeholder} label={undefined} onChange={context.onChange} />;
};

export const FormLabel: FC<IFormLabelProps> = (props: IFormLabelProps) => {
  useCommonProperties(props);
  return props.dataContext.model.hidden ? <></> : <Field {...props} className={props.className} col={props.col} row={props.row} colSpan={props.colSpan} rowSpan={props.rowSpan} style={props.style} labelPosition={props.labelPosition} minLabelWidth={props.minLabelWidth} maxLabelWidth={props.maxLabelWidth} component={FormFieldLayout} fieldTemplate={LabelFieldTemplate} dataContext={props.dataContext} name={props.dataContext.name} label={props.dataContext.label} validator={props.dataContext.getValidators()} />;
};
