import { ComponentBoundary, AutomationHelper } from "@kinetix/core";
import { FieldRenderProps, FieldWrapper } from "@progress/kendo-react-form";
import { Label } from "@progress/kendo-react-labels";
import { GridLayoutItem, GridLayoutItemProps } from "@progress/kendo-react-layout";
import { Popover } from "@progress/kendo-react-tooltip";
import React, { MutableRefObject, useCallback, useState } from "react";

import { IFormField, LabelPosition } from "./IFormField";
import { ValidationHelper } from "./ValidationHelper";
import "./FormFieldLayout.scss";
import { Subscription } from "rxjs";
import { FormBooleanVariation } from "./Checkbox/FormBoolean";

export interface IFieldTemplateContext {
  others: any;
  onChange: (event: { target?: any; value?: any }) => void;
  onInit(source: MutableRefObject<any>): Subscription;
}

export interface IFormFieldTemplate<FieldType extends IFormField> {
  (field: FieldType, context: IFieldTemplateContext): any;
}

export const FormFieldLayout = React.forwardRef<HTMLDivElement, FieldRenderProps>((fieldRenderProps: FieldRenderProps, ref) => {
  const [validationHover, showValidationHover] = useState(false);

  const { validationMessage, touched, modified, visited, valid, name, dataContext, fieldTemplate, labelPosition, minLabelWidth, className, maxLabelWidth, fieldContainerStyle, ...others } = fieldRenderProps;

  const anchor = React.useRef<HTMLDivElement>(null);
  const fieldContainerRef = React.useRef<HTMLDivElement>(null);
  const rootElement = React.useRef<HTMLDivElement>(null);
  const fieldRef = React.useRef<any>(null);
  const context = dataContext as IFormField;
  const fieldRenderer = fieldTemplate as IFormFieldTemplate<IFormField>;

  if (dataContext.model) {
    context.onFieldRender(fieldRenderProps);
  }
  React.useEffect(() => {
    var changeSubscription: Subscription | null = null;
    
    if (fieldRef.current) {
      changeSubscription = context.onFocusChanged.subscribe((s) => {
        if (fieldRef.current) {
          fieldRef.current.focus();
        }
      });
    }

    return () => {
      changeSubscription?.unsubscribe();
    };
  });

  const onChange = React.useCallback(
    (e: { target?: any; value?: any }) => {
      context.setValue(e.value);
    },
    [context]
  );

  const onKeyDown = React.useCallback(
    (e: React.KeyboardEvent<Element>) => {
      context.onKeyDown(e);
    },
    [context]
  );

  const handleCyclicTabEvent = useCallback(
    (event: any) => {
      onKeyDown(event);
    },
    [onKeyDown]
  );

  const onBlur = (source: MutableRefObject<any>) => {
    if (source && source.current) {
      try {
        source.current.removeEventListener("keydown", handleCyclicTabEvent);
      } catch {
        rootElement.current?.removeEventListener("keydown", handleCyclicTabEvent);
      }
    }

    //context.subscribeFocusChange(source);
    context.onLostFocus();
    showValidationHover(false);
  };

  const onFocus = (source: MutableRefObject<any>) => {
    if (source && source.current) {
      try {
        source.current.addEventListener("keydown", handleCyclicTabEvent);
      } catch {
        rootElement.current?.addEventListener("keydown", handleCyclicTabEvent);
      }
    }
    //context.subscribeFocusChange(source);

    context.onFocus();
    setTimeout(() => {
      showValidationHover(true);

      setTimeout(() => {
        showValidationHover(false);
      }, 2000);
    }, 200);
  };

  const onInit = React.useCallback(
    (source: MutableRefObject<any>): Subscription => {
      return context.subscribeFocusChange(source);
    },
    [context]
  );

  const handleFieldBlur = React.useCallback(
    (e: React.FocusEvent<HTMLDivElement, Element>) => {
      if (!fieldContainerRef.current?.contains(e.relatedTarget)) {
        onBlur({ current: e.target });
      }
    },
    [context]
  );

  const handleFieldFocus = React.useCallback(
    (e: React.FocusEvent<HTMLDivElement, Element>) => {
      if (!fieldContainerRef.current?.contains(e.relatedTarget)) {
        onFocus({ current: e.target });
      }
    },
    [context]
  );

  const validationContext = ValidationHelper.getValidation(context.model.validationMessage ? context.model.validationMessage : context.model.customValidation);
  const validationClass = ValidationHelper.getValidationClass(validationContext.type);
  const hasvalidationMessage = () => {
    const isInvalid = validationContext.message != null && validationContext.message.length > 0 && !(Boolean(context.model.valid) && Boolean(context.model.customValidation == null));
    return isInvalid;
  };

  return (
    <GridItemWrapper className={`form-layout ${className ? className : ""}`} col={others.col} row={others.row} colSpan={others.colSpan} rowSpan={others.rowSpan}>
      <div className={`field-root${context.model.hidden ? " hidden" : ""} `} ref={rootElement}>
        <FieldWrapper className={`focusable-form-field${labelPosition === LabelPosition.Left ? " leftLabel" : ""}`}>
          <span className={`labelContainer`}>
            {context.label && (
              <Label
                className="label"
                style={{
                  minWidth: minLabelWidth,
                  maxWidth: maxLabelWidth,
                }}
                editorId={context.name}
                editorDisabled={context.model.readonly || context.Owner?.model.readonly}
              >
                <span>{context.type !== "FormBooleanField" ? context.label : (context as any).variation === FormBooleanVariation.switch ? context.label : <>&nbsp;</>}</span>
              </Label>
            )}
            {context.model.required && <span className="required">&nbsp;*</span>}
          </span>
          <div className={`field-container${labelPosition === LabelPosition.Left ? " leftLabel" : ""}`} style={fieldContainerStyle}>
            <div ref={fieldContainerRef} className={`ui-field ${context.hasfocus ? "ui-field-focused" : ""}`} onFocus={handleFieldFocus} onBlur={(e) => handleFieldBlur(e)} data-automationid={context.label ? AutomationHelper.GetId(`${context.label}`) : context.label}>
              <ComponentBoundary>
                {fieldRenderer(context, {
                  others,
                  onChange,
                  onInit,
                })}
              </ComponentBoundary>
            </div>
            <div className={`overlay-required${labelPosition === LabelPosition.Left ? " leftLabel" : ""}`}>{context.model.required && <div data-automationid="required-indicator" className="required-indicator" />}</div>
          </div>
          <div
            data-automationid="validation-overlay"
            className={`overlay-validation${labelPosition === LabelPosition.Left ? " leftLabel" : ""}`}
            onMouseOverCapture={() => {
              showValidationHover(hasvalidationMessage());
            }}
            onMouseOutCapture={() => {
              showValidationHover(false);
            }}
          >
            {hasvalidationMessage() && <div data-automationid="validation-indicator" className={`validation k-icon k-font-icon ${validationClass}`} ref={anchor} />}
          </div>
        </FieldWrapper>
        <Popover className="field-popover-outline" show={validationHover} animate={{ openDuration: 0, closeDuration: 0 }} anchor={anchor.current} callout={true}>
          <div data-automationid="validation-messages" className="validationMessage">
            {validationContext.message}
          </div>
        </Popover>
      </div>
    </GridItemWrapper>
  );
});

export const GridItemWrapper = (props: GridLayoutItemProps) => {
  if (props.row || props.col || props.colSpan || props.rowSpan) return <GridLayoutItem {...props} />;
  else return <div {...props} />;
};
