import { Chip, ChipFocusEvent, ChipList, ChipListHandle, ChipProps } from "@progress/kendo-react-buttons";
import { get, isEqual } from "lodash";
import React, { createContext, FC, useContext, useEffect } from "react";
import { Subscription } from "rxjs";
import { IFormAutoCompleteChildProps } from "../FormAutoComplete";
import { FormAutoCompleteField } from "../FormAutoCompleteField";

export interface IChipProps extends ChipProps {
  field: FormAutoCompleteField;
}
const FieldContext = createContext<IFormAutoCompleteChildProps | undefined>(undefined);

export const ItemChipTemplate: FC<ChipProps> = (props: ChipProps): any => {
  const chipRef = React.useRef<ChipListHandle>(null);
  const parentProps = useContext(FieldContext);

  useEffect(() => {
    let subscription: Subscription | undefined;
    if (chipRef && chipRef.current && chipRef.current.element) {
      const isFirstChip = chipRef.current.element.classList.contains("chip-first");
      if (isFirstChip && parentProps) {
        subscription = parentProps.context.onInit({
          current: chipRef.current.element,
        });
      }
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [parentProps]);

  const isSelected = (field: FormAutoCompleteField, props: ChipProps): boolean => {
    if (field.model.value && field.model.value.value === props.dataItem.value) {
      return true;
    }
    chipRef.current?.element?.classList.remove("k-selected");
    //chipRef.current?.element?.classList.remove("k-focused");
    return false;
  };

  const getChipClass = (items: any[], field: FormAutoCompleteField, props: ChipProps): string | undefined => {
    const className = props.className ?? "";
    if (items && items.length > 1) {
      if (isEqual(items[0], props.dataItem)) {
        return `chip-first ${className}`;
      }

      if (isEqual(items[items.length - 1], props.dataItem)) {
        return `chip-last ${className}`;
      }
    }

    return className;
  };

  if (parentProps) {
    const items = parentProps.field.getOptions();
    const itemStyler = parentProps.context.others.flatListItemStyle;
    const selected = isSelected(parentProps.field, props);

    let chipModel = parentProps.field.model.chips.find((x) => x.text === props.text);

    if (chipModel) {
      chipModel.selected = selected;
      if (itemStyler) {
        const modifiedChip = itemStyler(chipModel);
        if (modifiedChip) {
          chipModel = modifiedChip;
        }
      }
    } else {
      chipModel = {};
    }

    const classList = chipRef.current?.element?.classList;
    if (classList) {
      //classList.remove("k-focus");
    }

    return <Chip ref={chipRef} className={`${getChipClass(items, parentProps.field, chipModel ? chipModel : {})} ${chipModel ? chipModel.className : ""}`} selected={chipModel?.selected} value={chipModel?.value} text={chipModel?.text} disabled={chipModel?.disabled} key={chipModel?.text} />;
  }
};

export const ChipListTemplate: FC<IFormAutoCompleteChildProps> = (props: IFormAutoCompleteChildProps): any => {
  if (props.field.model.chips.length === 0) {
    props.field.model.chips = props.field.model.data.map((d) => {
      return {
        id: d.value,
        value: d.value,
        selected: props.field.model.value === d.value,
        dataItem: d,
        text: get(d, props.field.displayName, ""),
      };
    });
  }
  const selection = props.field.selection == "Multiple" ? "multiple" : "single";

  return (
    <span className="fieldContainer" title={props.field.model.tooltip}>
      <span className="field">
        <FieldContext.Provider value={props}>
          <ChipList
            tabIndex={-1}
            data={props.field.getOptions()}
            textField={props.field.displayName}
            chip={ItemChipTemplate}
            name={props.field.name}
            disabled={props.field.model.disabled || props.field.Owner.model.disabled || props.field.model.readonly || props.field.Owner.model.readonly}
            required={props.field.model.required}
            valid={props.field.model.valid}
            value={props.field.model.value}
            {...props.context.others}
            selection={selection}
            onChange={(e) => {
              props.context.onChange(e);
            }}
          />
        </FieldContext.Provider>
      </span>
    </span>
  );
};
