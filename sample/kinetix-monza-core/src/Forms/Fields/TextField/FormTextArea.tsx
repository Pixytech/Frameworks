import { Field } from "@progress/kendo-react-form";
import { TextArea, TextAreaProps } from "@progress/kendo-react-inputs";
import { FC, useEffect, useRef } from "react";
import { Subscription } from "rxjs";
import { IFormFieldTemplate, IFieldTemplateContext, FormFieldLayout } from "../FormFieldLayout";
import { IFormFieldComponentProps, useCommonProperties } from "../IFormField";
import { FormTextField } from "./FormTextField";

export interface IFormTextAreaProps extends IFormFieldComponentProps,Omit<TextAreaProps, "label"> {
  dataContext: FormTextField;
}

export const TextAreaFieldTemplate: IFormFieldTemplate<FormTextField> = (field: FormTextField, context: IFieldTemplateContext): any => {
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
  return <TextArea name={field.name} title={field.model.value} ref={fieldRef} disabled={field.model.disabled || field.Owner?.model.disabled} required={field.model.required} readOnly={field.model.readonly || field.Owner?.model.readonly} valid={field.model.valid} {...context.others} value={field.model.value} placeholder={field.placeholder} label={undefined} onChange={context.onChange} />;
};

export const FormTextArera: FC<IFormTextAreaProps> = (props: IFormTextAreaProps) => {
  useCommonProperties(props);
  return props.dataContext.model.hidden ? <></> : <Field className={props.className} col={props.col} row={props.row} colSpan={props.colSpan} rowSpan={props.rowSpan} style={props.style} labelPosition={props.labelPosition} minLabelWidth={props.minLabelWidth} maxLabelWidth={props.maxLabelWidth} component={FormFieldLayout} fieldTemplate={TextAreaFieldTemplate} dataContext={props.dataContext} name={props.dataContext.name} label={props.dataContext.label} validator={props.dataContext.getValidators()} />;
};
