import { CoreTypes, IDialogComponent, IDialogContext, IocInject, IRestClientType, using, ViewModelBase, HttpRequestConfigurations, type IDialogService, type IContainer, type IRestClient, CompositeDisposable } from "@kinetix/core";
import { FormRenderProps } from "@progress/kendo-react-form";
import { get, set } from "lodash";

import { FormModel } from "./FormModel";
import { IFormViewModelBase, IFormViewModel } from "./IFormViewModel";
import { IMetaDataProviderType } from "./Services";
import type { IMetaDataProvider } from "./Services";
import { TicketHost } from "./TicketHost";
import { RuleEngine } from "./Rules";
import { IRuleEngine } from "./Rules";
import { ITicketTitleBar } from "./ITicketTitleBar";
import { TicketTitleBar } from "./TicketTitleBar";
import { TitleBarView } from "./TitleBarView";
import { getTicketData } from "../TicketHooks";
import { TicketData } from "../TicketData";
import { Subject, finalize ,Subscription} from "rxjs";
import { FormPart } from "./FormPart";
import { IFormField } from "./Fields/IFormField";
import { ValidationHelper } from "./Fields/ValidationHelper";
import { ValidationType } from "./Fields/ValidationType";

export abstract class FormViewModel<TModel extends FormModel> extends ViewModelBase<TModel> implements IFormViewModel<TModel> {
  // Dialog context before the window is created
  public readonly ticketDialog: TicketHost = new TicketHost();
  private ticketDataStream: Subject<any> = new Subject<any>();
  private _dialogService?: IDialogService;
  private _api?: IRestClient;
  private _metaCache?: IMetaDataProvider;
  private _ticketData: any;

  public get ticketData(): any {
    return this._ticketData;
  }

  public set ticketData(data: any) {
    this._ticketData = data;
    this.ticketDataStream.next(data);
  }

  public get dialogService(): IDialogService {
    if (!this._dialogService) {
      this._dialogService = this.container.build<IDialogService>(CoreTypes.IDialogService);
    }
    return this._dialogService;
  }

  public get api(): IRestClient {
    if (!this._api) {
      this._api = this.container.build<IRestClient>(IRestClientType);
    }
    return this._api;
  }

  public get metaCache(): IMetaDataProvider {
    if (!this._metaCache) {
      this._metaCache = this.container.build<IMetaDataProvider>(IMetaDataProviderType);
    }
    return this._metaCache;
  }

  readonly ruleEngine: IRuleEngine<IFormViewModelBase>;
  submitOperation: HttpRequestConfigurations.POST | HttpRequestConfigurations.PUT | HttpRequestConfigurations.PATCH = HttpRequestConfigurations.POST;

  protected metaEndPoint: string;
  tickeMeta: any;
  id?: { id: string; version: string };
  propertyMap: { index: number; name: string }[] = [];
  indexCounter: number = 0;
  private formfields: IFormField[] = [];
  private formParts: FormPart[] = [];

  private form: FormRenderProps;
  formInitialized: boolean;
  formInitializing: boolean;
  public launchContext?: TicketData;
  formValidationSubsctiotion?: Subscription;

  public getFields(): IFormField[] {
    const fields = this.formfields.sort((a, b) => {
      return a.renderIndex - b.renderIndex;
    });
    return fields;
  }

  readonly container: IContainer;
  eventType: string;
  titleBar: ITicketTitleBar;
  private tabCycleCompleted: boolean = false;

  constructor(@IocInject(CoreTypes.IContainer) container: IContainer, @IocInject(CoreTypes.IDialogService) dialogService?: IDialogService, @IocInject(IMetaDataProviderType) metaDataProvider?: IMetaDataProvider, @IocInject(IRestClientType) api?: IRestClient) {
    super();
    this.container = container;
    this._api = api;
    this._dialogService = dialogService;
    this._metaCache = metaDataProvider;
    this.ticketDialog.canClose = true;
    this.ticketDialog.canMaximize = true;
    this.ticketDialog.canMinimize = false;
    this.ticketDialog.draggable = true;
    this.ticketDialog.resizable = true;
    this.ticketDialog.isModel = false;
    this.ruleEngine = new RuleEngine<IFormViewModelBase>(this);
    this.titleBar = new TicketTitleBar();
    this.ticketDataStream.subscribe(async (x) => {
      this.ruleEngine.dispose();
      await this.loadTicket();
    });
  }

  reload(): void {
    if (this.launchContext) {
      this.updateModel((x) => {
        x.busyText = "Loading...";
        x.reloading = true;
      });
      getTicketData(this.api, this.dataUrl, this.launchContext).subscribe((data) => {
        this.ticketData = data;
        const suspended = new CompositeDisposable();
        this.ruleEngine.dispose();
        suspended.addRange([this.SuspendNotifications(), this.titleBar.SuspendNotifications(), this.ruleEngine.suspend()]);
        using(suspended, async () => {
          this.formInitialized = false;
          this.isinitialized = false;
          this.formfields = [];
          this.formParts = [];
          this.onFormReset();
          await this.formInitialize();
          await this.initialize();
        });

        this.titleBar.notifyModelChanged();
        this.updateModel((x) => {
          x.busyText = "";
          x.reloading = false;
        });
      });
    } else {
      this.ticketDataStream.next(this.ticketData);
    }
  }

  onChange(name: string, value: any): void {
    if (this.form) {
      this.form.onChange(name, { value: value });
    }
  }
  onFormReset(): void {
    this.form?.onFormReset();
    this.updateModel((m) => m.formKey + 1);
  }

  allowPin: boolean;

  dataUrl: string;

  getFieldByName(name: string): IFormField | undefined {
    const field = this.getFields().find((x) => x.name === name);
    return field;
  }

  public addFormField(field: IFormField): void {
    field.Owner = this;
    this.formfields.push(field);
  }

  public addFormPart(part: FormPart): void {
    part.Owner = this;
    this.formParts.push(part);
  }

  public removeFormField(field: IFormField): void {
    const index = this.formfields.findIndex((formField) => formField === field);
    if (index >= 0) {
      this.formfields.splice(index, 1);
    }
  }

  getFieldIndex(property: IFormField): number {
    var field = this.getFields().find((x) => x.name === property.name);
    if (!field) {
      field = property;
      this.addFormField(field);
    }

    if (field.renderIndex < 0) {
      this.indexCounter = this.indexCounter + 1;
      field.renderIndex = this.indexCounter;
    }

    return field.renderIndex;
  }

  onFormRender(formRenderProps: FormRenderProps): void {
    this.form = formRenderProps;
    this.indexCounter = 0;
    this.getFields().forEach((property) => {
      property.renderIndex = -1;
    });
    // fields inside tabs causing not available afetr form render
    //this.formfields = [];
    using(this.SuspendNotifications(), () => {
      this.updateModel((m) => {
        m.allowSubmit = formRenderProps.allowSubmit;
        m.errors = formRenderProps.errors;
        m.modified = formRenderProps.modified;
        m.submitted = formRenderProps.submitted;
        m.touched = formRenderProps.touched;
        m.valid = formRenderProps.valid;
        m.visited = formRenderProps.visited;
      });
      //console.debug(`onFormRender-`, this.model);
    });
  }

  showSubmit: boolean;

  OnDialogCreated(context: IDialogContext, dialogComponent: IDialogComponent): void {
    context.initialHeight = this.ticketDialog.initialHeight;
    context.initialWidth = this.ticketDialog.initialWidth;
    context.stage = this.ticketDialog.stage;
    context.title = this.ticketDialog.title ? this.ticketDialog.title : `${this.titleBar.model.title} ${this.titleBar.model.subtitle}`;
    context.canClose = this.ticketDialog.canClose;
    context.canMaximize = this.ticketDialog.canMaximize;
    context.canMinimize = this.ticketDialog.canMinimize;
    context.draggable = this.ticketDialog.draggable;
    context.resizable = this.ticketDialog.resizable;
    context.isModel = this.ticketDialog.isModel;
    context.headerTemplate = this.ticketDialog.headerTemplate ? this.ticketDialog.headerTemplate : TitleBarView;
    context.cyclicTab = this.ticketDialog.cyclicTab;
    if (dialogComponent) {
      this.ticketDialog.OnDialogCreated(dialogComponent);
    }
  }
  OnDialogClose(): void {}

  async formInitialize(): Promise<void> {
    if (this.formInitialized || this.formInitializing) {
      return;
    }
    this.formInitializing = true;
    this.initializeFields();

    for (const formPart of this.formParts) {
      await formPart.formInitialize();

      for (const formPartField of formPart.getFields()) {
        this.addFormField(formPartField);
      }
    }

    await this.onFormInitialize();
    this.formInitialized = true;
  }

  protected override async onInitializeOnce?(): Promise<void> {
    // in case this is not hosted by tickets
    await this.formInitialize();
    if (this.dataUrl && this.launchContext) {
      this.loadTicketData();
    } else {
      await this.loadTicket();
    }
  }

  loadTicketData(): void {
    if (this.launchContext) {
      this.updateModel((x) => (x.busyText = " "));
      getTicketData(this.api, this.dataUrl, this.launchContext)
        .pipe(
          finalize(async () => {
            await this.loadTicket();
          })
        )
        .subscribe({
          next: async (ticketData) => {
            this._ticketData = ticketData;
          },
          error: (e: Error) => {
            this.updateModel((model) => {
              model.customValidation = ValidationHelper.setValidation(` Error:${e.message}`, ValidationType.Error);
            });
          },
        });
    }
  }

  private async loadTicket(): Promise<void> {
    if (this.ticketData?.identifier?.ids) {
      const ids = this.ticketData.identifier.ids as Array<any>;
      this.id = ids.find((id) => id.domain === "KINETIX");
    }
    for (const formPart of this.formParts) {
      formPart.ticketData = this.ticketData;
    }
    await this.setMetaData();
    this.setInitialData();
    this.setValidators();
    for (const formPart of this.formParts) {
      await formPart.onDataLoad();
    }
    await this.onDataLoad();
    this.titleBar.notifyModelChanged();

    for (const formPart of this.formParts) {
      await formPart.onFormLoad();
    }
    await this.onFormLoad();
    await this.ruleEngine.onLoad();
    setTimeout(() => {
      this.setInitialFocus();
    }, 200);
    this.updateModel((x) => (x.busyText = ""));
  }

  protected async onDataLoad(): Promise<void> {}

  protected setInitialFocus(): void {
    if (!this.moveToNextField(0)) {
      const fields = this.getFields();
      if (fields.length > 0) {
        fields[0].focus();
      }
    }
  }

  public moveToNextField(fieldIndex: number): boolean {
    var currentIndex = fieldIndex;
    if (!this.tabCycleCompleted) {
      const fields = this.getFields();
      if (currentIndex >= fields.length - 1 && !this.tabCycleCompleted) this.tabCycleCompleted = true;
      for (let index = currentIndex; index < fields.length; index++) {
        const property = fields[index];
        let isEnabled = !property.model.readonly && !property.model.disabled && !property.model.hidden && ((property as any).canExecute ? (property as any).canExecute() : true);
        if (property?.model?.required && isEnabled) {
          const value = property.model.value;
          if (!value) {
            console.debug("focus to", property.name);
            property.focus();
            return true;
          }
        }
      }
    }
    return false;
  }

  private setValidators(): void {
    using(this.SuspendNotifications(), () => {
      this.getFields().forEach((property) => {
        if (property.setValidators) {
          property.setValidators();
        }
      });
    });
  }

  public setFieldMeta(property: IFormField): void {
    if (this.tickeMeta) {
      const path = property.metaPath;
      if (path) {
        const metaPath = path; //path.replaceAll(".", ".fields.");
        // get field meta
        const fieldMeta = get(this.tickeMeta.fields, metaPath);
        if (fieldMeta) {
          property.setMetaData(fieldMeta);
        } else {
          console.warn(`missing meta for property ${property.name} => path: ${path}`);
        }
      }
    }
  }

  protected async setMetaData(): Promise<void> {
    if (this.metaEndPoint && !this.tickeMeta) {
      try {
        this.tickeMeta = await this.metaCache.getMetaData(this.metaEndPoint);
      } catch (e) {
        console.error("Unable to get meta", e);
      }
    }

    if (this.tickeMeta) {
      using(this.SuspendNotifications(), () => {
        this.getFields().forEach((property) => {
          this.setFieldMeta(property);
        });
      });
    }
  }

  private initializeFields(): void {
    const keys = Object.keys(this);
    keys.forEach((key) => {
      const field = get(this, key, null);
      const property = field as IFormField;
      if (property?.model && property.type) {
        if (property.type === "FormPart") {
          this.addFormPart(field as FormPart);
        } else {
          this.addFormField(property);
        }
      }
    });
  }

  public getInitialData(): { [name: string]: any } {
    var data: { [name: string]: any } = {};
    this.getFields().map((property) => {
      data[property.name] = property.getSubmitValue();
      return property;
    });

    return data;
  }

  protected onFormLoad(): Promise<void> {
    return Promise.resolve();
  }
  protected abstract onFormInitialize(): Promise<void>;

  public setInitialData(): void {
    if (this.ticketData) {
      using(this.SuspendNotifications(), () => {
        this.getFields()
          .filter((property) => property.type !== "FormButtonField")
          .forEach((property) => {
            const path = property.name;
            if (path) {
              const nodeData = get(this.ticketData, path);
              if (nodeData) {
                property.setValue(nodeData);
              } else {
                console.warn(`missing data for property ${property.name} => path: ${path}`);
              }
            } else {
              console.warn(`missing fieldPath for property ${property.name}`, property);
            }
          });
      });
    }

    for (const formPart of this.formParts) {
      formPart.onSetInitialData();
    }
    this.onSetInitialData();
  }

  protected onSetInitialData(): void {}

  public async submit(e: { [name: string]: any }): Promise<void> {
    console.debug("FormViewModel.submit", e);
    const request = this.ticketData ? this.ticketData : {};
    if (!this.ticketData && this.id) {
      set(request, "identifier.ids", [this.id]);
    }

    await this.onSubmit(request);

    if (this.dataUrl) {
      console.debug("request", request);
      this.updateModel((m) => {
        m.submitting = true;
        m.customValidation = null;
        m.busyText = "Submitting";
      });

      this.onPostData(request);
    }
  }

  protected onPostData(request: any) {
    const responseHandle = {
      next: async (response: any) => await this.onPostTicketDataNext(response),
      error: (err: any) => this.onPostDataError(err),
      complete: () => this.onPostDataComplete(),
    };

    switch (this.submitOperation) {
      case HttpRequestConfigurations.PATCH:
        this.api.patch<any, any>(this.dataUrl, request).subscribe(responseHandle);
        break;
      case HttpRequestConfigurations.POST:
        this.api.post<any, any>(this.dataUrl, request).subscribe(responseHandle);
        break;
      case HttpRequestConfigurations.PUT:
        this.api.put<any, any>(this.dataUrl, request).subscribe(responseHandle);
        break;
    }
  }

  protected async onPostTicketDataNext(response: any): Promise<void> {
    if (response?.value?.issues?.some((item: any) => `${item.severity}`.toLowerCase() === "error")) {
      this.setRemoteValidationIssues(response.value.issues);
    } else if (response.status == "Failure" && response.description) {
      this.updateModel((m) => (m.customValidation = `${ValidationHelper.setValidation(`${response.description}${response.value ? "Value: " + JSON.stringify(response.value, null, " ") : ""}`, ValidationType.Error)}`));
    } else {
      await this.onSuccessSubmit(response);
    }
  }

  protected async onPostDataNext(response: any, fullPath: string): Promise<void> {
    if (response?.status === "Failure") {
      this.setRemoteValidationIssues([
        {
          fullPath: fullPath,
          severity: "Error",
          description: response.description,
        },
      ]);
    } else {
      await this.onSuccessSubmit(response);
    }
  }

  protected onPostDataError(e: any): void {
    const errorDescription = `${e}`;
    this.updateModel((m) => {
      m.customValidation = errorDescription;
      m.allowSubmit = false;
    });
  }

  protected onPostDataComplete(): void {
    this.updateModel((m) => {
      m.submitting = false;
      m.busyText = "";
    });
  }

  protected async onSuccessSubmit(response: any): Promise<void> {
    if (!this.titleBar.model.isPinned) {
      if (this.ticketDialog) {
        this.dialogService.Close(this);
      }
    } else {
      this.setInitialData();
      this.notifyModelChanged();
    }
  }

  async onSubmit(request: any): Promise<void> {
    this.getFields().forEach((field) => {
      if (field.name) {
        set(request, field.name, field.getSubmitValue());
      }
    });
  }

  setRemoteValidationIssues(issues: any) {
    let nonFieldError = "";

    issues.forEach((x: any) => {
      if (`${x.severity}`.toLowerCase() == "error") {
        const field = this.formfields.find((f) => f.name == x.fullPath);
        if (field?.name) {
          // Adding Server Validation errors for UI fields
          let msg = field.label + " : " + x.description;
          field.setCustomValidation(ValidationType.Error, msg);
        } else {
          // Adding Server Validation errors for non UI fields (Trade level errors)
          nonFieldError += (x.fullPath ? x.fullPath + " : " : "") + x.description + "\n";
        }
      }
    });

    if (nonFieldError) {
      this.updateModel((m) => (m.customValidation = `${ValidationHelper.setValidation("Something went wrong, Contact support team", ValidationType.Error)}`));
      console.error(nonFieldError);
    }
  }
}
