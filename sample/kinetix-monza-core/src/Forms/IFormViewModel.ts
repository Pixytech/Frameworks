import { HttpRequestConfigurations, IContainer, IDialogAware, IRestClient, IViewModel, IViewModelBase } from "@kinetix/core";
import { FormRenderProps } from "@progress/kendo-react-form";
import { IFormField } from "./Fields";
import { FormModel, FormPartModel } from "./FormModel";
import { ITicketTitleBar } from "./ITicketTitleBar";
import { IRuleEngineBase } from "./Rules/IRuleEngineBase";
import { TicketHost } from "./TicketHost";
import { TicketData } from "../TicketData";
import { IMetaDataProvider } from "./Services";

export interface IFormViewModelBase extends IViewModel, IDialogAware {
  readonly container: IContainer;
  readonly metaCache: IMetaDataProvider;
  eventType: string;
  dataUrl: string;
  readonly submitOperation: Exclude<HttpRequestConfigurations, HttpRequestConfigurations.DELETE | HttpRequestConfigurations.GET>;
  /**
   * A callback for emiting changes to a specific field without using the Field component
   * ([see example]({% slug common_scenarios_form %}#toc-changing-the-field-value)).
   *
   * > Use `onChange` only if you cannot achieve the desired behavior through the Field component.
   */
  onChange: (
    name: string,
    options: {
      value: any;
    }
  ) => void;
  /**
   * A callback for resetting the Form.
   */
  onFormReset: () => void;
  readonly ruleEngine: IRuleEngineBase;
  getFieldByName(name: string): IFormField | undefined;
  formInitialize(): Promise<void>;
  getFieldIndex(property: IFormField): number;
  onFormRender(formRenderProps: FormRenderProps): void;
  getInitialData(): { [name: string]: any };
  moveToNextField(currentIndex: number): boolean;
  setFieldMeta(property: IFormField): void;
  addFormField(field: IFormField): void;

  getFields(): IFormField[];
  id?: { id: string; version: string };
  ticketData: any;
  ticketDialog: TicketHost;
  showSubmit: boolean;
  allowPin: boolean;
  submit(e: { [name: string]: any }): Promise<void>;
  titleBar: ITicketTitleBar;
  get api(): IRestClient;
}
export interface IFormViewModel<TModel extends FormModel> extends IViewModelBase<TModel>, IFormViewModelBase {
  launchContext?: TicketData;
  reload(): void;
}

export interface IFormPart extends IFormViewModel<FormPartModel> {
  type: string;
  Owner: IFormViewModel<FormModel>;
}
