import { MultiSelectTree, getMultiSelectTreeValue } from "@progress/kendo-react-dropdowns";
import React, { FC, useEffect } from "react";
import { Subscription } from "rxjs";
import { IFormAutoCompleteChildProps } from "../FormAutoComplete";

export const MultiSelectTreeTemplate: FC<IFormAutoCompleteChildProps> = (props: IFormAutoCompleteChildProps): any => {
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
        <MultiSelectTree
          ref={fieldRef}
          dataItemKey={props.field.dataItemKey}
          checkField={props.field.checkField}
          checkIndeterminateField={props.field.checkIndeterminateField}
          clearButton={props.field.clearButton}
          expandField={props.field.expandField}
          subItemsField={props.field.subItemsField}
          textField={props.field.displayName}
          data={props.field.getTreeOptions()}
          onExpandChange={(e) => props.field.onExpandChange(e.item)}
          filterable={props.field.filterable}
          onFilterChange={(e) => props.field.filterData({ ...e.filter, type: props.field.fieldType })}
          disabled={props.field.model.disabled || props.field.Owner?.model.disabled || props.field.model.readonly || props.field.Owner?.model.readonly}
          loading={props.field.model.loading}
          name={props.field.name}
          required={props.field.model.required}
          valid={props.field.model.valid}
          {...props.context.others}
          popupSettings={{
            ...(props.context.others?.popupSettings ? { ...props.context.others.popupSettings, width: "100%", className: `${props.context.others.popupSettings.className} custom__autocomplete_top` } : { className: "custom__autocomplete_top" }),
          }}
          onChange={(e) => {
            const value = props.field.value;
            const fields = {
              dataItemKey: props.field.dataItemKey,
              checkField: props.field.checkField,
              checkIndeterminateField: props.field.checkIndeterminateField,
              expandField: props.field.expandField,
              subItemsField: props.field.subItemsField,
            };
            const newValue = getMultiSelectTreeValue(props.field.getTreeOptions(), { ...fields, ...e, value });
            props.context.onChange({ target: e.target, value: newValue });
          }}
          placeholder={props.field.placeholder}
          value={props.field.model.value}
          label={undefined}
        />
      </span>
    </span>
  );
};
