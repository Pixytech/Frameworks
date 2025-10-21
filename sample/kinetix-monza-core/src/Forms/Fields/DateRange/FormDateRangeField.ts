import { FormField } from "../FormField";
import { DateRangePickerHandle, SelectionRange } from "@progress/kendo-react-dateinputs";
import { AcceleratorModel } from "../AccelaratorModel";
import { FieldModel } from "../FieldModel";
import { using } from "@kinetix/core";

export class FormDateRangeModel extends FieldModel<SelectionRange> {
  public show: boolean = false;
}
export class FormDateRangeField extends FormField<FormDateRangeModel> {
  public readonly type: string = "FormDateRangeField";
  public EnableAcelerator: boolean = false;

  public showPopupOnFocus: boolean | undefined;
  public AcceleratorList = [new AcceleratorModel("T", "Today"), new AcceleratorModel("TW", "This Week"), new AcceleratorModel("MTD", "Month to Date"), new AcceleratorModel("QTD", "Quarter to Date"), new AcceleratorModel("YTD", "Year to Date")];
  inFocus: boolean = false;

  protected createModel(): FormDateRangeModel {
    return new FormDateRangeModel({ start: null, end: null });
  }

  /* public setValue(value: SelectionRange): void {
    super.setValue(new Date(value));
  } */
  /* setValidators(): void {
    super.setValidators();
    this.validators.push(new DateValidator());
  } */

  onKeyDown(e: React.KeyboardEvent<HTMLElement>): void {
    if (this.EnableAcelerator) {
      if (e.key === "ArrowDown" && e.ctrlKey) {
        e.preventDefault();
        this.handleAcceleratorPopup(true);
        return;
      }
    }
    return super.onKeyDown(e);
  }

  public get value(): SelectionRange {
    return this.model.value;
  }

  public set value(fieldValue: SelectionRange) {
    super.setValue(fieldValue);
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

  calculateDateRange(rangeType: string, date: Date): SelectionRange {
    let fieldValue: SelectionRange = { start: null, end: date };
    switch (rangeType) {
      case "TW":
        fieldValue.start = new Date(new Date(date).setDate(date.getDate() - (date.getDay() || 7) + 1));
        break;
      case "MTD":
        fieldValue.start = new Date(date.getFullYear(), date.getMonth(), 1);
        break;
      case "QTD":
        fieldValue.start = new Date(date.getFullYear(), (Math.floor((date.getMonth() + 3) / 3) - 1) * 3, 1);
        break;
      case "YTD":
        fieldValue.start = new Date(date.getFullYear(), 0, 1);
        break;
      case "T":
      default:
        fieldValue.start = date;
        break;
    }
    return fieldValue;
  }

  public handleAccelerator(e: DateRangePickerHandle, val: any): void {
    using(this.SuspendNotifications(), () => {
      const current = new Date();
      let fieldValue = this.calculateDateRange(val, new Date(current.getFullYear(), current.getMonth(), current.getDate()));
      this.setValue(fieldValue);
      this.showPopupOnFocus = false;
      this.inFocus = true;
      this.updateModel((x) => (x.show = false));
    });
    this.notifyModelChanged();
  }

  public handleAcceleratorPopup = (toggle: boolean) => {
    using(this.SuspendNotifications(), () => {
      this.setValue(this.value);
      this.updateModel((x) => (x.show = toggle));
    });
  };

  getSubmitValue() {
    /* switch (this.fieldType) {
      case DataTypes.dateTime:
        return this.model.value
          ? Helpers.formatDateTime(this.model.value)
          : this.model.value;
      case DataTypes.date:
        return this.model.value
          ? Helpers.formatDate(this.model.value)
          : this.model.value;
      default: */
    return this.model.value;
  }
}
