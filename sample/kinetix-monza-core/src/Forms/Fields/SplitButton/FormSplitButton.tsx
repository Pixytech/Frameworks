import React, { FC } from "react";
import { SplitButton, SplitButtonHandle } from "@progress/kendo-react-buttons";
import { Field, FieldRenderProps } from "@progress/kendo-react-form";
import { StackLayout } from "@progress/kendo-react-layout";
import { Popover } from "@progress/kendo-react-tooltip";
import { Subscription } from "rxjs";
import { IFormFieldComponentProps, useCommonProperties } from "../IFormField";
import { FormSplitButtonField } from "./FormSplitButtonField";
import { SvgIcon } from "@progress/kendo-react-common";
import { useViewModelInstance } from "@kinetix/core";
import { SplitButtonProps } from "@progress/kendo-react-buttons/ListButton/models/ListButtonProps";

export interface IFormSplitButtonProps extends IFormFieldComponentProps, SplitButtonProps {
  dataContext: FormSplitButtonField;
  commandParameter?: any;
  hideDisabled?: boolean;
}

export const SplitButtonTemplate = (fieldRenderProps: FieldRenderProps) => {
  const { dataContext, commandParameter, hideDisabled, value, validationMessage, touched, modified, visited, valid, required, allowEmpty, readonly, hidden, customValidation, ...splitButtonProps } = fieldRenderProps;
  const splitButtonRef = React.useRef<SplitButtonHandle>(null);
  const buttonContainerRef = React.useRef<HTMLDivElement>(null);
  const [showTooltip, setShowTooltip] = React.useState(false);
  const field = useViewModelInstance(dataContext as FormSplitButtonField);
  field.onFieldRender(fieldRenderProps);
  const itemsTemplate= (props: any) => {
    return <span >
      {props.item.svgIcon && <SvgIcon style={{marginRight:'10px'}} icon={props.item.svgIcon} themeColor={props.item.themeColor}  />} 
      <span>{props.item.text}</span>
    </span>
  };

  React.useEffect(() => {
    const canExecuteSubscription = field.onCanExecuteChanged.subscribe(() => {
      field.notifyModelChanged();
    });

    var focusSubscription: Subscription | null = null;
    if (splitButtonRef.current) {
      focusSubscription = field.onFocusChanged.subscribe((s) => {
        if (splitButtonRef.current && splitButtonRef.current.element) {
          splitButtonRef.current.element.focus();
        }
      });
    }

    return () => {
      focusSubscription?.unsubscribe();
      canExecuteSubscription.unsubscribe();
    };
  });

  const isDisabled = field.model.disabled || field.Owner?.model.disabled || field.model.readonly || field.Owner?.model.readonly || !field.canExecute(commandParameter);
  
  return hideDisabled && isDisabled ? (
    <>
      {hideDisabled} {isDisabled}
    </>
  ) : (
    <StackLayout align={{ horizontal: "start", vertical: "middle" }}>
      <div 
        ref={buttonContainerRef}
        onMouseEnter={() => field.model.tooltip && isDisabled && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <SplitButton
          {...splitButtonProps}
          itemRender={itemsTemplate}
          ref={splitButtonRef}
          themeColor={field.model.selectedButton?.themeColor}
          text={field.model.selectedButton?.text}
          svgIcon={field.model.selectedButton?.svgIcon}
          items={field.model.buttons}
          disabled={isDisabled}
          onButtonClick={(e) => field.execute({commandParameter})}
          onItemClick={(e)=>{
            field.updateModel(x=>x.selectedButton = e.item);
            field.execute({commandParameter});
          }}
        />
      </div>
      {field.model.tooltip && isDisabled && (
        <Popover
          show={showTooltip}
          anchor={buttonContainerRef.current}
          position="bottom"
        >
          <div style={{ padding: '8px', maxWidth: '300px', whiteSpace: 'pre-line' }}>
            {field.model.tooltip}
          </div>
        </Popover>
      )}
    </StackLayout>
  );
};
export const FormSplitButton: FC<IFormSplitButtonProps> = (props: IFormSplitButtonProps) => {
  useCommonProperties(props);
  return props.dataContext.model.hidden ? <></> : <Field name={props.dataContext.name} {...props} component={SplitButtonTemplate} />;
};
