import { Field } from "@progress/kendo-react-form";
import { NumericTextBox } from "@progress/kendo-react-inputs";
import { NumberFormatOptions } from "@progress/kendo-react-intl";
import React, { FC, useEffect, useRef } from "react";
import { Subscription } from "rxjs";
import { Popup } from "@progress/kendo-react-popup";
import { Button, ButtonGroup } from "@progress/kendo-react-buttons";
import { Label } from "@progress/kendo-react-labels";
import { AcceleratorModel } from "../AccelaratorModel";
import { IFormFieldTemplate, IFieldTemplateContext, FormFieldLayout } from "../FormFieldLayout";
import { IFormFieldComponentProps, useCommonProperties } from "../IFormField";
import { FormNumericField } from "./FormNumericField";

interface IFormNumericProps extends IFormFieldComponentProps {
  dataContext: FormNumericField;
  EnableAcelerator?: boolean;
  minPrecision?: number;
}

export const NumericFieldTemplate: IFormFieldTemplate<FormNumericField> = (field: FormNumericField, context: IFieldTemplateContext): any => {
  const fieldRef = useRef(null);
  const buttonGroupRef = useRef(null);
  const anchor = React.useRef<HTMLButtonElement | null>(null);

  const modifiedScale = (field.precision > 0 ? field.precision : 8) - (field.scale > 1 ? field.scale.toString().length - 1 : 0);

  const formatOptions: NumberFormatOptions = {
    style: "decimal",
    maximumFractionDigits: modifiedScale > 0 ? modifiedScale : 0,
    minimumFractionDigits: context.others.minPrecision > 0 ? context.others.minPrecision : 0,
  };

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
    if (field.show) {
      setTimeout(
        //@ts-ignore
        () => buttonGroupRef.current?._element.childNodes[0]?.focus(),
        200
      );
    }
  }, [field.show]);

  return (
    <>
      <span className="fieldWrapper">
        <span className="field">
          <NumericTextBox inputStyle={context.others.inputStyle} name={field.name} ref={fieldRef} disabled={field.model.disabled || field.Owner.model.disabled || field.model.readonly || field.Owner.model.readonly} required={field.model.required} valid={field.model.valid} spinners={false} value={field.model.value} format={formatOptions} label={undefined} placeholder={field.placeholder} onChange={context.onChange} />
        </span>

        {field.EnableAcelerator && (
          <button className="icon-class-numeric" type="button" tabIndex={-1} onClick={() => field.handleAcceleratorPopup(true)} disabled={field.model.disabled || field.Owner.model.disabled || field.model.readonly || field.Owner.model.readonly} ref={anchor}>
            <span className="k-input-spinner"></span>
          </button>
        )}
      </span>
      <Popup anchor={anchor.current} show={field.show} popupClass={"accelerator-popup"}>
        <div
          onBlur={(e) => {
            if (e.currentTarget !== e.relatedTarget?.parentElement?.parentElement) field.handleAcceleratorPopup(false);
          }}
          onKeyDown={(e: any) => field.buttonGroupKeydown(e, buttonGroupRef)}
          className="popup-container"
        >
          <div>
            <Label>In millions:</Label>
          </div>
          <ButtonGroup ref={buttonGroupRef}>
            {field.AcceleratorList.map((item: AcceleratorModel, index: number) => (
              <Button key={index} tabIndex={index} onClick={() => fieldRef.current && field.handleAccelerator(fieldRef.current, item.value)} togglable={false} title={item.value}>
                {item.value}
              </Button>
            ))}
          </ButtonGroup>
        </div>
      </Popup>
    </>
  );
};

export const FormNumeric: FC<IFormNumericProps> = (props: IFormNumericProps) => {
  useCommonProperties(props, () => {
    if (props.EnableAcelerator) {
      props.dataContext.EnableAcelerator = props.EnableAcelerator;
    }
  });

  return props.dataContext.model.hidden ? (
    <></>
  ) : (
    <Field className={props.className} col={props.col} row={props.row} colSpan={props.colSpan} rowSpan={props.rowSpan} style={props.style} labelPosition={props.labelPosition} minLabelWidth={props.minLabelWidth} maxLabelWidth={props.maxLabelWidth} component={FormFieldLayout} fieldTemplate={NumericFieldTemplate} dataContext={props.dataContext} name={props.dataContext.name} label={props.dataContext.label} validator={props.dataContext.getValidators()} inputStyle={props.inputStyle} minPrecision={props.minPrecision} EnableAcelerator={props.dataContext.EnableAcelerator} />
  );
};
