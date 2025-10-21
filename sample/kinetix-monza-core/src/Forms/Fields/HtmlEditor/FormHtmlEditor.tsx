import { Field } from "@progress/kendo-react-form";
import { FC, useEffect, useRef } from "react";
import { Subscription } from "rxjs";
import { FormHtmlEditorField } from "./FormHtmlEditorField";
import { IFormFieldTemplate, IFieldTemplateContext, FormFieldLayout } from "../FormFieldLayout";
import { IFormFieldComponentProps, useCommonProperties } from "../IFormField";
import { HtmlEditor, IHtmlEditorProps } from "@kinetix/core";

interface IFormHtmlEditorFieldProps extends IFormFieldComponentProps, IHtmlEditorProps {
  dataContext: FormHtmlEditorField;
}

export const HtmlEditorFieldTemplate: IFormFieldTemplate<FormHtmlEditorField> = (field: FormHtmlEditorField, context: IFieldTemplateContext): any => {
  const fieldRef = useRef<any>(null);
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
  return <HtmlEditor dataContext={field} name={field.name} ref={fieldRef} disabled={field.model.disabled || field.Owner?.model.disabled || field.model.readonly || field.Owner?.model.readonly} required={field.model.required} valid={field.model.valid} placeholder={field.placeholder} {...context.others} label={undefined} onChange={context.onChange} />;
};

export const FormHtmlEditor: FC<IFormHtmlEditorFieldProps> = (props: IFormHtmlEditorFieldProps) => {
  useCommonProperties(props, () => {});
  return props.dataContext.model.hidden ? <></> : <Field {...props} className={props.className} component={FormFieldLayout} fieldContainerStyle={props.fieldContainerStyle} fieldTemplate={HtmlEditorFieldTemplate} dataContext={props.dataContext} name={props.dataContext.name} label={props.dataContext.label} validator={props.dataContext.getValidators()} />;
};
