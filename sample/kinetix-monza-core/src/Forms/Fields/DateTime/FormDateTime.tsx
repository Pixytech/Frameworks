import { DatePicker, DateTimePicker, DateTimePickerHandle } from "@progress/kendo-react-dateinputs";
import { Field } from "@progress/kendo-react-form";
import { FC, useEffect, useRef } from "react";
import { Subscription } from "rxjs";
import { FormDateTimeField } from "./FormDateTimeField";
import { IFormFieldTemplate, IFieldTemplateContext, FormFieldLayout } from "../FormFieldLayout";
import { IFormFieldComponentProps, useCommonProperties } from "../IFormField";
import { Tooltip } from "@progress/kendo-react-tooltip";

interface IFormDateTimeFieldProps extends IFormFieldComponentProps {
  dataContext: FormDateTimeField;
  allowTime?: boolean;
}

export const DateTimeFieldTemplate: IFormFieldTemplate<FormDateTimeField> = (field: FormDateTimeField, context: IFieldTemplateContext): any => {
  const fieldRef = useRef<DateTimePickerHandle>(null);
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
      {field.allowTime ? (
        <DateTimePicker name={field.name} ref={fieldRef} disabled={field.model.disabled || field.Owner.model.disabled || field.model.readonly || field.Owner.model.readonly} required={field.model.required} valid={field.model.valid} placeholder={field.placeholder} {...context.others} value={field.model.value} label={undefined} onChange={context.onChange} />
      ) : (
        <DatePicker name={field.name} ref={fieldRef} disabled={field.model.disabled || field.Owner.model.disabled || field.model.readonly || field.Owner.model.readonly} required={field.model.required} valid={field.model.valid} placeholder={field.placeholder} {...context.others} value={field.model.value} label={undefined} onChange={context.onChange} />
      )}
    </Tooltip>
  );
};

export const FormDateTime: FC<IFormDateTimeFieldProps> = (props: IFormDateTimeFieldProps) => {
  useCommonProperties(props, () => {
    if (props.allowTime) {
      props.dataContext.allowTime = props.allowTime;
    }
  });
  return props.dataContext.model.hidden ? <></> : <Field className={props.className} col={props.col} row={props.row} colSpan={props.colSpan} rowSpan={props.rowSpan} labelPosition={props.labelPosition} minLabelWidth={props.minLabelWidth} maxLabelWidth={props.maxLabelWidth} style={props.style} component={FormFieldLayout} fieldTemplate={DateTimeFieldTemplate} dataContext={props.dataContext} name={props.dataContext.name} label={props.dataContext.label} validator={props.dataContext.getValidators()} />;
};
