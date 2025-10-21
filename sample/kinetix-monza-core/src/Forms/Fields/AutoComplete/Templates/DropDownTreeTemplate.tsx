import { DropDownTree } from "@progress/kendo-react-dropdowns";
import React, { FC, useEffect } from "react";
import { Subscription } from "rxjs";
import { IFormAutoCompleteChildProps } from "../FormAutoComplete";

export const DropDownTreeTemplate: FC<IFormAutoCompleteChildProps> = (props: IFormAutoCompleteChildProps): any => {
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
        <DropDownTree
          ref={fieldRef}
          filterable={props.field.filterable}
          onFilterChange={(e) => props.field.filterData({ ...e.filter, type: props.field.fieldType })}
          clearButton={props.field.clearButton}
          checkField={props.field.checkField}
          checkIndeterminateField={props.field.checkIndeterminateField}
          subItemsField={props.field.subItemsField}
          textField={props.field.displayName}
          dataItemKey={props.field.dataItemKey}
          expandField={props.field.expandField}
          onExpandChange={(e) => props.field.onExpandChange(e.item)}
          data={props.field.getTreeOptions()}
          loading={props.field.model.loading}
          disabled={props.field.model.disabled || props.field.Owner?.model.disabled || props.field.model.readonly || props.field.Owner?.model.readonly}
          name={props.field.name}
          required={props.field.model.required}
          valid={props.field.model.valid}
          {...props.context.others}
          popupSettings={{
            ...(props.context.others?.popupSettings ? { ...props.context.others.popupSettings, width: "100%", className: `${props.context.others.popupSettings?.className} custom__autocomplete_top` } : { className: "custom__autocomplete_top" }),
          }}
          label={undefined}
          placeholder={props.field.placeholder}
          value={props.field.model.value}
          onChange={props.context.onChange}
        />
      </span>
    </span>
  );
};
