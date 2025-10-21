import { DateRangePicker, DateRangePickerHandle } from "@progress/kendo-react-dateinputs";
import { Popup } from "@progress/kendo-react-popup";
import { Button, ButtonGroup } from "@progress/kendo-react-buttons";
import { Field } from "@progress/kendo-react-form";
import { FC, useEffect, useRef } from "react";
import { Subscription } from "rxjs";
import { FormDateRangeField } from "./FormDateRangeField";
import { Label } from "@progress/kendo-react-labels";
import { AcceleratorModel } from "../AccelaratorModel";
import { IFormFieldTemplate, IFieldTemplateContext, FormFieldLayout } from "../FormFieldLayout";
import { IFormFieldComponentProps, useCommonProperties } from "../IFormField";
import { SvgIcon } from "@progress/kendo-react-common";
import { calendarIcon } from "@progress/kendo-svg-icons";
import { Tooltip } from "@progress/kendo-react-tooltip";

export interface IFormDateRangeFieldProps extends IFormFieldComponentProps {
  dataContext: FormDateRangeField;
  EnableAcelerator?: boolean;
}

export const DateRangeFieldTemplate: IFormFieldTemplate<FormDateRangeField> = (field: FormDateRangeField, context: IFieldTemplateContext): any => {
  const fieldRef = useRef<DateRangePickerHandle>(null);
  const buttonGroupRef = useRef(null);
  const anchor = useRef<HTMLButtonElement | null>(null);

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

  useEffect(() => {
    if (field.model.show) {
      setTimeout(
        //@ts-ignore
        () => buttonGroupRef.current?._element.childNodes[0].focus(),
        200
      );
    }
  }, [field.model.show]);

  return (
    <Tooltip anchorElement="target" parentTitle={true}>
      <Popup anchor={anchor.current} show={field.model.show} popupClass={"accelerator-popup"}>
        <div
          onBlur={(e: any) => {
            if (e.currentTarget !== e.relatedTarget?.parentElement?.parentElement) field.handleAcceleratorPopup(false);
          }}
          onKeyDown={(e: any) => field.buttonGroupKeydown(e, buttonGroupRef)}
          className="popup-container"
        >
          <div>
            <Label>Start From:</Label>
          </div>
          <ButtonGroup ref={buttonGroupRef}>
            {field.AcceleratorList?.map((item: AcceleratorModel, index: number) => (
              <Button key={item.description} tabIndex={index} onClick={() => fieldRef.current && field.handleAccelerator(fieldRef.current, item.value)} togglable={false} title={item.description}>
                {item.value}
              </Button>
            ))}
          </ButtonGroup>
        </div>
      </Popup>
      <span className="fieldWrapper">
        <span className="field">
          <DateRangePicker
            name={field.name}
            show={field.showPopupOnFocus}
            ref={fieldRef}
            className="k-daterangepicker"
            disabled={field.model.disabled || field.Owner?.model.disabled || field.model.readonly || field.Owner?.model.readonly}
            required={field.model.required}
            valid={field.model.valid}
            placeholder={field.placeholder}
            {...context.others}
            value={field.model.value}
            label={undefined}
            startDateInputSettings={{
              label: "",
              disabled: field.model.disabled || field.Owner?.model.disabled || field.model.readonly || field.Owner?.model.readonly,
            }}
            endDateInputSettings={{
              label: "",
              disabled: field.model.disabled || field.Owner?.model.disabled || field.model.readonly || field.Owner?.model.readonly,
            }}
            onChange={context.onChange}
            onBlur={() => {
              setTimeout(() => {
                if (field.inFocus && field.showPopupOnFocus != undefined) field.inFocus = false;
              }, 200);
            }}
            onKeyDown={field.onKeyDown}
            onFocus={() => {
              if (!field.inFocus && field.showPopupOnFocus != undefined) {
                field.showPopupOnFocus = undefined;
              }
              field.inFocus = true;
            }}
          />
        </span>
        {field.EnableAcelerator && (
          <button tabIndex={-1} className="icon-class-date" type="button" onClick={() => field.handleAcceleratorPopup(!field.model.show)} disabled={field.model.disabled || field.Owner?.model.disabled || field.model.readonly || field.Owner?.model.readonly} ref={anchor}>
            <SvgIcon icon={calendarIcon} size="small" />
          </button>
        )}
      </span>
    </Tooltip>
  );
};

export const FormDateRange: FC<IFormDateRangeFieldProps> = (props: IFormDateRangeFieldProps) => {
  useCommonProperties(props, () => {
    if (props.EnableAcelerator) {
      props.dataContext.EnableAcelerator = props.EnableAcelerator;
    }
  });

  return props.dataContext.model.hidden ? <></> : <Field className={props.className} col={props.col} row={props.row} colSpan={props.colSpan} rowSpan={props.rowSpan} style={props.style} labelPosition={props.labelPosition} minLabelWidth={props.minLabelWidth} maxLabelWidth={props.maxLabelWidth} component={FormFieldLayout} fieldTemplate={DateRangeFieldTemplate} dataContext={props.dataContext} name={props.dataContext.name} label={props.dataContext.label} validator={props.dataContext.getValidators()} />;
};
