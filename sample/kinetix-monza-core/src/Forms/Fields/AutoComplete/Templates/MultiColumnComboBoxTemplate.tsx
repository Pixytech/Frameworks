import { ListItemProps, MultiColumnComboBox } from "@progress/kendo-react-dropdowns";
import { get } from "lodash";
import React, { FC, useEffect } from "react";
import { Subscription } from "rxjs";
import { IFormAutoCompleteChildProps } from "../FormAutoComplete";
import { Popup } from "@progress/kendo-react-popup";
import { Button, ButtonGroup } from "@progress/kendo-react-buttons";
import { Label } from "@progress/kendo-react-labels";
import { AcceleratorModel } from "../../AccelaratorModel";

export const MultiColumnComboBoxTemplate: FC<IFormAutoCompleteChildProps> = (props: IFormAutoCompleteChildProps): any => {
  const fieldRef = React.useRef(null);
  const buttonGroupRef = React.useRef(null);
  const listRef = React.useRef(null);
  const anchor = React.useRef<HTMLButtonElement | null>(null);
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

  useEffect(() => {
    if (props.field.model.show) {
      setTimeout(
        //@ts-ignore
        () => buttonGroupRef.current?._element.childNodes[0].focus(),
        200
      );
    }
  }, [props.field.model.show]);

  const itemRender = (
    li: React.ReactElement<
      HTMLLIElement,
      string | React.JSXElementConstructor<any>
    >,
    itemProps: ListItemProps
  ) => {

    const children =  props.field.columns.map((col, i) => {
      return (
        <span
          className="k-table-td"
          style={{ width: col.width }}
          key={col.field || ""}
        >
          {itemProps.dataItem[col.field || ""]}
        </span>
      );
    });

   
    return React.cloneElement(li, { ...li.props }, children);
  };
  
  return (
    <span className={props.field.EnableAcelerator ? "fieldContainer instrument-accelerator" : "fieldContainer"} title={get(props.field.model.value, props.field.displayName, "Choose an option")}>
      <Popup anchor={anchor.current} show={props.field.model.show} popupClass={"accelerator-popup"}>
        <div
          onBlur={(e: any) => {
            if (e.currentTarget !== e.relatedTarget?.parentElement?.parentElement) props.field.handleAcceleratorPopup(false);
          }}
          onKeyDown={(e: any) => props.field.buttonGroupKeydown(e, buttonGroupRef, listRef)}
          className="popup-container"
        >
          <div>
            <Label>Templates:</Label>
          </div>
          <ButtonGroup ref={buttonGroupRef}>
            {props.field.AcceleratorList.map((item: AcceleratorModel, index: number) => (
              <Button key={`${item.value}-${index}`} tabIndex={index} onClick={() => props.field.filterAcceleratorData(item.value)} togglable={false} title={item.value}>
                {item.description}
              </Button>
            ))}
          </ButtonGroup>

          <ButtonGroup ref={listRef} className="accelerator-list-options">
            {props.field.model.acceleratorData?.map((item: any, index: number) => (
              <Button key={`list-${index}`} tabIndex={index} onClick={() => props.field.handleAccelerator(item)} togglable={false}>
                {item.description}
              </Button>
            ))}
          </ButtonGroup>
        </div>
      </Popup>
      <span className="fieldContainer" title={props.field.model.tooltip}>
        <span className="field">
          <MultiColumnComboBox
            ref={fieldRef}
            style={{ pointerEvents: "visible" }}
            columns={props.field.columns}
            data={props.field.getOptions()}
            filterable={true}
            textField={props.field.displayName}
            onFilterChange={(e) => props.field.filterData({ ...e.filter, type: props.field.fieldType })}
            required={props.field.model.required}
            name={props.field.name}
            disabled={props.field.model.disabled || props.field.Owner.model.disabled || props.field.model.readonly || props.field.Owner.model.readonly}
            valid={props.field.model.valid}
            loading={props.field.model.loading}
            itemRender={itemRender}
            {...props.context.others}
            popupSettings={{
              ...(props.context.others?.popupSettings ? { ...props.context.others.popupSettings, className: `${props.context.others.popupSettings.className} custom__autocomplete_top` } : { className: "custom__autocomplete_top" }),
            }}
            label={undefined}
            placeholder={props.field.placeholder}
            value={props.field.model.value}
            onChange={props.context.onChange}
            onOpen={() => {
              console.debug(`[FormAutoComplete] MultiColumnComboBox onOpen triggered`);
              // Load data when dropdown opens if using a dataset and not already loaded
              if (props.field.dataset && props.field.model.data.length === 0 && !props.field.model.loading) {
                console.debug(`[FormAutoComplete] Loading data on dropdown open for dataset: ${props.field.dataset}`);
                props.field.fetachData(undefined);
              }
            }}
          />
        </span>
        {props.field.EnableAcelerator && (
          <button className="icon-class-multi" type="button" tabIndex={-1} onClick={() => props.field.handleAcceleratorPopup(true)} disabled={props.field.model.disabled || props.field.Owner.model.disabled || props.field.model.readonly || props.field.Owner.model.readonly} ref={anchor}>
            <span className="k-input-spinner"></span>
          </button>
        )}
      </span>
    </span>
  );
};
