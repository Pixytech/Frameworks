import { IBlotter } from "..";
import { FormBooleanField, FormButtonField, FormModel, IFormViewModel } from "../../Forms";

export const IBlotterToolbarType = Symbol.for("IBlotterToolbarType");

export class BlotterToolbarModel extends FormModel {
  isLoadingData: boolean = false;
  rtuCount: number = 0;
  allowAutoRefesh: boolean = false;
  allowManualRefesh: boolean = false;
}

export interface IBlotterToolbar extends IFormViewModel<BlotterToolbarModel> {
  isActive(): boolean;
  clearFiltersButton: FormButtonField;
  toggleDetailsButton: FormButtonField;
  toggleGroupsButton: FormButtonField;
  refreshButton: FormButtonField;
  exportPdfButton: FormButtonField;
  exportExcelButton: FormButtonField;

  blotter: IBlotter;
  autoRefresh: FormBooleanField;
  optionsButton: FormButtonField;
}
