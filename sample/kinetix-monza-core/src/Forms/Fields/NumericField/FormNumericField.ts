import { FormField } from "../FormField";
import { FieldModel } from "../FieldModel";
import { get } from "lodash";
import React from "react";
import { NumericValidator } from "../Validators/NumericValidator";
import { AcceleratorModel } from "../AccelaratorModel";
import { isDataTypeNumber } from "../../../Data";
import { NumericTextBoxHandle } from "@progress/kendo-react-inputs";

export class FormNumericField extends FormField<FieldModel<number | null>> {
  public readonly type: string = "FormNumericField";
  public precision: number = 0;
  public scale: number = 1;
  min: number | undefined = undefined;
  max: number | undefined = undefined;
  public EnableAcelerator: boolean = false;
  public show: boolean = false;
  public AcceleratorList: AcceleratorModel[] = [new AcceleratorModel(1, "1"), new AcceleratorModel(2, "2"), new AcceleratorModel(5, "5"), new AcceleratorModel(10, "10"), new AcceleratorModel(15, "15"), new AcceleratorModel(20, "20")];

  protected createModel(): FieldModel<number | null> {
    return new FieldModel<number | null>(null);
  }

  setMetaData(fieldMeta: any): void {
    super.setMetaData(fieldMeta);
    this.precision = fieldMeta.precision ? fieldMeta.precision : 0;
    this.min = isDataTypeNumber(this.fieldType)
      ? get(
          get(fieldMeta, "constraints", []).find((x: any) => x.type === "minValue"),
          "min"
        )
      : undefined;
    this.max = isDataTypeNumber(this.fieldType)
      ? get(
          get(fieldMeta, "constraints", []).find((x: any) => x.type === "maxValue"),
          "max"
        )
      : undefined;
  }

  public getValueOrDefault(): number {
    return this.model.value ?? 0;
  }

  public get value(): number | null {
    return this.model.value;
  }

  public set value(fieldValue: number | null) {
    this.setValue(fieldValue);
  }

  public setValue(value: number | null): void;
  public setValue(value: any): void {
    this.setValueWithScale(value, this.scale);
  }

  private setValueWithScale(value: any, scale: number) {
    if (value && value.value != null) {
      super.setValue(value.value * scale);
    } else {
      super.setValue(value && value * scale);
    }
  }

  setValidators(): void {
    super.setValidators();
    this.validators.push(new NumericValidator());
  }

  onKeyDown(e: React.KeyboardEvent<HTMLElement>): void {
    if (this.EnableAcelerator) {
      if (e.key === "m") {
        setTimeout(() => {
          this.setValueWithScale(this.value, 1);
        }, 200);
        //@ts-ignore
        e.target.value = this.value * 1000;
        return;
      } else if (e.key === "ArrowDown" && e.ctrlKey) {
        this.handleAcceleratorPopup(true);
        return;
      }
    }
    return super.onKeyDown(e);
  }
  public buttonGroupKeydown(e: any, ElementRef: any): void {
    const childNodes = ElementRef.current._element.childNodes;
    //@ts-ignore
    const activeIndex = document.activeElement.tabIndex;
    if (e.key === "ArrowRight") {
      if (childNodes[activeIndex + 1]) childNodes[activeIndex + 1].focus();
      else childNodes[0].focus();
    } else if (e.key === "ArrowLeft") {
      if (activeIndex > 0) childNodes[activeIndex - 1].focus();
    } else if (e.key === "ArrowUp") {
      this.handleAcceleratorPopup(false);
      this.focus();
      return;
    } else if (e.key === "Escape") {
      this.handleAcceleratorPopup(false);
      this.focus();
      return;
    }
  }
  public handleAccelerator(e: NumericTextBoxHandle, val: number): void {
    this.show = false;
    this.setValue(val * 1000000);
    if (e.element) {
      e.element.value = `${val * 1000000}`;
    }
    setTimeout(() => this.focus(), 200);
  }

  public handleAcceleratorPopup = (toggle: boolean) => {
    this.show = toggle;
    setTimeout(() => {
      this.setValue(this.value);
    }, 200);
  };

  public getSubmitValue() {
    const isNumber = isDataTypeNumber(this.fieldType);
    const modelValue = this.model.value;
    if (modelValue == null) {
      if (this.model.allowEmpty) {
        return null;
      }

      return isNumber ? { value: 0, scale: this.precision } : 0;
    }

    if (isNumber) {
      if (this.precision > 0) {
        return { value: modelValue / this.scale, scale: this.precision };
      }
      const decimalPrecision = this.getDecimalPrecision(modelValue);
      return {
        value: modelValue / this.scale,
        scale: decimalPrecision,
      };
    }

    return modelValue;
  }

  private getDecimalPrecision(num: number): number {
    if (Number.isInteger(num) || Number.isNaN(num)) {
      return 0;
    }

    const decimalStr = num.toString().split(".")[1];
    return decimalStr.length;
  }
}
