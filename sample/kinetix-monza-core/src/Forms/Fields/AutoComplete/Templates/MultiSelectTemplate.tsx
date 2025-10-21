import { MultiSelect, TagData } from "@progress/kendo-react-dropdowns";
import { Checkbox } from "@progress/kendo-react-inputs";
import { get } from "lodash";
import React, { FC, useEffect } from "react";
import { Subscription } from "rxjs";
import { IFormAutoCompleteChildProps } from "../FormAutoComplete";

export const MultiSelectTemplate: FC<IFormAutoCompleteChildProps> = (props: IFormAutoCompleteChildProps): any => {
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

  const itemRender = (li: any, itemProps: any) => {
    const displayName = get(itemProps.dataItem, itemProps.textField, "");
    const itemChildren = <Checkbox name={displayName} checked={itemProps.selected} label={displayName} />;
    return React.cloneElement(li, li.props, itemChildren);
  };

  const tagRender = (tagData: TagData, li: any) => {
    const item = React.cloneElement(li, li.props, [<span title={tagData.text}>{tagData.text}</span>, li.props.children]);
    return item;
  };

  return (
    <span className="fieldContainer" title={props.field.model.tooltip}>
      <span className="field">
        <MultiSelect
          ref={fieldRef}
          data={props.field.getOptions()}
          filterable={true}
          itemRender={itemRender}
          autoClose={false}
          tagRender={tagRender}
          textField={props.field.displayName}
          dataItemKey={props.field.dataItemKey}
          onFilterChange={(e) => props.field.filterData({ ...e.filter, type: props.field.fieldType })}
          loading={props.field.model.loading}
          name={props.field.name}
          disabled={props.field.model.disabled || props.field.Owner.model.disabled || props.field.model.readonly || props.field.Owner.model.readonly}
          required={props.field.model.required}
          valid={props.field.model.valid}
          filter={props.field.model.text}
          {...props.context.others}
          popupSettings={{
            ...(props.context.others?.popupSettings ? { ...props.context.others.popupSettings, className: `${props.context.others.popupSettings.className} custom__autocomplete_top` } : { className: "custom__autocomplete_top" }),
          }}
          value={props.field.model.value}
          label={undefined}
          placeholder={props.field.placeholder}
          onChange={props.context.onChange}
        />
      </span>
    </span>
  );
};
