import { ComboBox } from "@progress/kendo-react-dropdowns";
import React, { FC, useEffect } from "react";
import { Subscription } from "rxjs";
import { IFormAutoCompleteChildProps } from "../FormAutoComplete";

export const ComboBoxTemplate: FC<IFormAutoCompleteChildProps> = (props: IFormAutoCompleteChildProps): any => {
  const fieldRef = React.useRef(null);
  useEffect(() => {
    let subscription: Subscription | undefined;
    if (fieldRef?.current) {
      subscription = props.context.onInit(fieldRef);
    }
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [props.context]);
  return (
    <span className="fieldContainer" title={props.field.model.tooltip}>
      <span className="field">
        <ComboBox
          ref={fieldRef}
          allowCustom={props.field.allowCustom}
          clearButton={props.field.clearButton}
          data={props.field.getOptions()}
          filterable={true}
          textField={props.field.displayName}
          onFilterChange={(e) => props.field.filterData({ ...e.filter, type: props.field.fieldType })}
          name={props.field.name}
          required={props.field.model.required}
          loading={props.field.model.loading}
          disabled={props.field.model.disabled || props.field.Owner?.model.disabled || props.field.model.readonly || props.field.Owner?.model.readonly}
          valid={props.field.model.valid}
          {...props.context.others}
          popupSettings={{
            ...(props.context.others?.popupSettings ? { ...props.context.others.popupSettings, className: `${props.context.others.popupSettings.className} custom__autocomplete_top` } : { className: "custom__autocomplete_top" }),
          }}
          value={props.field.model.value}
          placeholder={props.field.placeholder}
          label={undefined}
          onChange={props.context.onChange}
        />
      </span>
    </span>
  );
};
