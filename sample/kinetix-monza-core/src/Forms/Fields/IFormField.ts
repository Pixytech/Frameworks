import { IViewModelBase, useViewModelInstance } from "@kinetix/core";
import { FieldRenderProps, FieldValidatorType } from "@progress/kendo-react-form";
import React from "react";
import { Observable, Subscription } from "rxjs";
import { DataTypes } from "../../Data";
import { FormModel } from "../FormModel";
import { IFormViewModel } from "../IFormViewModel";
import { IFieldModelBase } from "./FieldModelBase";
import { IFieldValidator } from "./IFieldValidator";
import { UpdateSourceTrigger } from "./UpdateSourceTrigger";
import { ValidationType } from "./ValidationType";

export interface IFormField extends IViewModelBase<IFieldModelBase> {
  subscribeFocusChange(source: React.MutableRefObject<any>): Subscription;
  setCustomValidation(type: ValidationType, message: string): void;
  readonly type: string;
  readonly fieldType: DataTypes;
  renderIndex: number;
  readonly onFocusChanged: Observable<void>;
  readonly handleTabNavigation: boolean;
  focus(): void;
  Owner: IFormViewModel<FormModel>;
  validators: IFieldValidator[];
  updateSourceTrigger: UpdateSourceTrigger;
  readonly metaPath: string;
  name: string;
  mapDomainModel(namePath: string, metaPath?: string): void;
  label: any;
  placeholder?: string;
  readonly hasfocus: boolean;
  setValidators(): void;
  getValidators(): FieldValidatorType[] | undefined;
  onLostFocus(): void;
  onFocus(): void;
  onFieldRender(fieldRenderProps: FieldRenderProps): void;
  onKeyDown(e: React.KeyboardEvent<Element>): void;
  setValue(value: any): void;
  getSubmitValue(): any;
  setMetaData(meta: any): void;
}

export enum LabelPosition {
  Left = "Left",
  Top = "Top",
}
export interface IFormFieldComponentProps {
  className?: string;
  style?: React.CSSProperties;
  inputStyle?: React.CSSProperties;
  dataContext: IFormField;
  label?: any;
  placeholder?: string;
  updateSourceTrigger?: UpdateSourceTrigger;
  required?: boolean;
  readonly?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  col?: number;
  row?: number;
  colSpan?: number;
  rowSpan?: number;
  labelPosition?: LabelPosition;
  minLabelWidth?: number | string;
  maxLabelWidth?: number | string;
}

export function useCommonProperties(props: IFormFieldComponentProps, additionalPropConfigure?: () => void): void {
  const dataContext = props.dataContext;
  useViewModelInstance(dataContext);
  if (!dataContext.isinitialized) {
    //useEffect(()=>{
    // using(dataContext.SuspendNotifications(),()=>{
    if (props && props.label && props.dataContext) {
      dataContext.label = props.label;
    }

    if (props && props.placeholder && props.dataContext) {
      dataContext.placeholder = props.placeholder;
    }

    if (props && props.updateSourceTrigger && props.dataContext) {
      dataContext.updateSourceTrigger = props.updateSourceTrigger;
    }

    if (props && props.required && props.dataContext) {
      dataContext.model.required = props.required;
    }

    if (props && props.readonly && props.dataContext) {
      dataContext.model.readonly = props.readonly;
    }

    if (props && props.disabled && props.dataContext) {
      dataContext.model.disabled = props.disabled;
    }

    if (props && props.hidden && props.dataContext) {
      dataContext.model.hidden = props.hidden;
    }
    if (additionalPropConfigure) {
      additionalPropConfigure();
    }
  }

  //})

  // },[]);
}
