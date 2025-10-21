import { Field } from "@progress/kendo-react-form";
import { TextBox, TextBoxProps } from "@progress/kendo-react-inputs";
import { Tooltip } from "@progress/kendo-react-tooltip";
import { FC, useEffect, useRef } from "react";
import { Subscription } from "rxjs";
import { IFormFieldTemplate, IFieldTemplateContext, FormFieldLayout } from "../FormFieldLayout";
import { IFormFieldComponentProps, useCommonProperties } from "../IFormField";
import { FormTextField } from "./FormTextField";

export interface IFormTextProps extends IFormFieldComponentProps, Omit<TextBoxProps, "label"> {
  dataContext: FormTextField;
}

export const TextFieldTemplate: IFormFieldTemplate<FormTextField> = (field: FormTextField, context: IFieldTemplateContext): any => {
  const fieldRef = useRef(null);
  const { dataContext, hideDisabled, value, validationMessage, touched, modified, visited, valid, required, allowEmpty, readonly, hidden, customValidation, ...textboxProps } = context.others;
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
  return (
    <Tooltip anchorElement="target" parentTitle={true}>
      <TextBox {...textboxProps} name={field.name} title={field.showTooltip ? `${field.model.value}` : undefined} ref={fieldRef} disabled={field.model.disabled || field.Owner?.model.disabled || field.model.readonly || field.Owner?.model.readonly} required={field.model.required} valid={field.model.valid} value={field.model.value} placeholder={field.placeholder} onChange={context.onChange} />
    </Tooltip>
  );
};

export const FormText: FC<IFormTextProps> = (props: IFormTextProps) => {
  useCommonProperties(props);
  return props.dataContext.model.hidden ? <></> : <Field {...props} className={props.className} col={props.col} row={props.row} colSpan={props.colSpan} rowSpan={props.rowSpan} style={props.style} labelPosition={props.labelPosition} minLabelWidth={props.minLabelWidth} maxLabelWidth={props.maxLabelWidth} component={FormFieldLayout} fieldTemplate={TextFieldTemplate} dataContext={props.dataContext} name={props.dataContext.name} label={props.dataContext.label} validator={props.dataContext.getValidators()} />;
};
