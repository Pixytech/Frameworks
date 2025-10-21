import React, { FC, useEffect } from "react";
import { Subscription } from "rxjs";
import { IFormAutoCompleteChildProps } from "../FormAutoComplete";
import { RadioGroup } from "@progress/kendo-react-inputs";
import { get } from "lodash";

export const RadioButtonListTemplate: FC<IFormAutoCompleteChildProps> = (props: IFormAutoCompleteChildProps): any => {
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
    <span className="fieldContainer radio-list" title={props.field.model.tooltip}>
      <span className="field">
        <RadioGroup 
          ref={fieldRef} 
          data={props.field.getOptions().map(x=>{return {value: x.value, label:get(x,props.field.displayName) }})} 
          onChange={props.context.onChange}
          
          value={props.field.model.value?.value}
          
          disabled={props.field.model.disabled || props.field.Owner?.model.disabled || props.field.model.readonly || props.field.Owner?.model.readonly}
          name={props.field.name}
          />
      </span>
    </span>
  );
};
