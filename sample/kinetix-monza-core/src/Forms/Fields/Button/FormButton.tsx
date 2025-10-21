import { Button, ButtonProps } from "@progress/kendo-react-buttons";
import { Field, FieldRenderProps } from "@progress/kendo-react-form";
import { StackLayout } from "@progress/kendo-react-layout";
import { Subscription } from "rxjs";
import { IFormFieldComponentProps, useCommonProperties } from "../IFormField";
import { FormButtonField } from "./FormButtonField";
import React, { FC } from "react";

export interface IFormButtonProps extends IFormFieldComponentProps, ButtonProps {
  dataContext: FormButtonField;
  commandParameter?: any;
  hideDisabled?: boolean;
}

export const ButtonTemplate = (fieldRenderProps: FieldRenderProps) => {
  const fieldRef = React.useRef<Button>(null);

  // exclude out props and collect all button props
  const { dataContext, commandParameter, hideDisabled, value, validationMessage, touched, modified, visited, valid, required, allowEmpty, readonly, hidden, customValidation, children, ...buttonProps } = fieldRenderProps;

  const field = dataContext as FormButtonField;

  field.onFieldRender(fieldRenderProps);

  React.useEffect(() => {
    const canExecuteSubscription = field.onCanExecuteChanged.subscribe(() => {
      field.notifyModelChanged();
    });

    var changeSubscription: Subscription | null = null;
    if (fieldRef.current) {
      changeSubscription = field.onFocusChanged.subscribe((s) => {
        if (fieldRef.current && fieldRef.current.element) {
          fieldRef.current.element.focus();
        }
      });
    }

    return () => {
      changeSubscription?.unsubscribe();
      canExecuteSubscription.unsubscribe();
    };
  });

  const disabled = field.model.disabled || field.Owner?.model.disabled || field.model.readonly || field.Owner?.model.readonly || !field.canExecute(commandParameter);
  return hideDisabled && disabled ? (
    <>
      {hideDisabled} {disabled}
    </>
  ) : (
    <StackLayout align={{ horizontal: "start", vertical: "middle" }}>
      <Button
        {...buttonProps}
        type="button"
        ref={fieldRef}
        size={buttonProps.size || "small"}
        disabled={disabled}
        onClick={() => field.execute(commandParameter)}
        onFocus={() => {
          fieldRef.current?.setState({ selected: true });
        }}
        onBlur={() => {
          fieldRef.current?.setState({ selected: false });
        }}
      >
        {children}
      </Button>
    </StackLayout>
  );
};
export const FormButton: FC<IFormButtonProps> = (props: IFormButtonProps) => {
  useCommonProperties(props);
  return props.dataContext.model.hidden ? <></> : <Field name={props.dataContext.name} {...props} component={ButtonTemplate} />;
};
