import "reflect-metadata";
import React from "react";
import { ApplicationCache, CoreTypes, HttpRequestConfigurations, IContainer, IDialogComponent, IDialogContext, IDialogService, IRestClient, IRestClientType } from "@kinetix/core";
import { cleanup, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { createMock } from "ts-auto-mock";
import { IMetaDataProvider, IMetaDataProviderType, MetaDataProvider } from "./Services";
import { FieldModelBase, FormNumericField, FormTextField, IFormField } from "./Fields";
import { FormViewModel } from "./FormViewModel";
import { FormModel } from "./FormModel";
import { Subject, of } from "rxjs";
import { arrange, stubComponent } from "../../../../testing";
import { FormRenderProps } from "@progress/kendo-react-form";
import { TicketData } from "../TicketData";
import { getTicketData } from "../TicketHooks";
import { FormPart } from "./FormPart";

// Base Package
describe("Kinetix Monza Core", () => {
  let mockContainer: IContainer;
  let mockDialogService: IDialogService;
  let mockMetaDataProvider: IMetaDataProvider;
  let mockApiClient: IRestClient;
  let sut: DummyFormViewModel;
  let mockField1: IFormField;
  let mockField2: IFormField;
  let mockField3: IFormField;

  let apiSubject: Subject<any>;

  class DummyFormModel extends FormModel {}

  class DummyFormPart extends FormPart {
    protected async onPartInitialize(): Promise<void> {
      this.textField1.mapDomainModel("textField1");
    }

    textField1: FormTextField = new FormTextField(this);
  }
  class DummyFormViewModel extends FormViewModel<DummyFormModel> {
    protected async onFormInitialize(): Promise<void> {
      this.textField.mapDomainModel("textField");
    }

    protected createModel(): FormModel {
      return new DummyFormModel();
    }

    public setInitialData(): void {
      this.InitalData = "InitalData";
      super.setInitialData();
    }

    public InitalData: string;
    textField: FormTextField = new FormTextField(this);
    numericField: FormNumericField = new FormNumericField(this);
    formpart: DummyFormPart = new DummyFormPart(this.container);
  }

  beforeEach(() => {
    mockDialogService = createMock<IDialogService>();
    
    mockApiClient = createMock<IRestClient>();
    mockContainer = createMock<IContainer>();

    apiSubject = new Subject<any>();
    arrange(mockContainer).stubMethod("build", () => mockApiClient, [IRestClientType]);
    mockMetaDataProvider = new MetaDataProvider(new ApplicationCache(mockContainer));
    sut = new DummyFormViewModel(mockContainer, mockDialogService, mockMetaDataProvider, mockApiClient);

    mockField1 = createMock<IFormField>({ model: new FieldModelBase() });
    mockField2 = createMock<IFormField>({ model: new FieldModelBase() });
    mockField3 = createMock<IFormField>({ model: new FieldModelBase() });

    mockField1.renderIndex = 1;
    mockField2.renderIndex = 2;
    mockField3.renderIndex = 3;
    mockField1.name = "Test1";
    mockField2.name = "Test2";
    mockField3.name = "Test3";

    sut.addFormField(mockField3);
    sut.addFormField(mockField1);
    sut.addFormField(mockField2);
  });

  // Note: running cleanup afterEach is done automatically for you in @testing-library/react@9.0.0 or higher
  // unmount and cleanup DOM after the test is finished.
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });
  // Testing Component
  describe("FormViewModel", () => {
    it("formInitialize only once", async () => {
      (sut as any).onFormInitialize = jest.fn();
      (sut.formpart as any).onPartInitialize = jest.fn();
      await sut.formInitialize();
      expect(sut.formInitialized).toBe(true);
      expect((sut as any).onFormInitialize).toBeCalledTimes(1);
      expect((sut.formpart as any).onPartInitialize).toBeCalledTimes(1);
    });

    it("Load initial data", async () => {
      (sut as any).onFormInitialize = jest.fn();
      sut["metaEndPoint"] = "test";
      arrange(mockMetaDataProvider).stubMethod("getMetaData", () =>
        of({
          fields: {
            textField: {},
          },
        })
      );
      sut.dataUrl = "some-dataUrl";
      sut.launchContext = createMock<TicketData>();
      stubComponent<typeof getTicketData>("getTicketData", "../../packages/kinetix-monza-core/src/TicketHooks.ts", () => of([]));
      await sut.initialize();
      expect(sut.formInitialized).toBe(true);
      expect(sut.tickeMeta).toBeDefined();
      expect((sut as any).onFormInitialize).toBeCalledTimes(1);
    });

    it("Reload ticket on data changed externally", async () => {
      (sut as any).onDataLoad = jest.fn();
      sut["metaEndPoint"] = "test";
      sut.metaCache.get<any>("somekey");
      arrange(mockApiClient).stubMethod("get", () =>
        of({
          fields: {
            textField: {},
          },
        }),["test"]
      );
      sut.dataUrl = "some-dataUrl";
      await sut.initialize();
      sut.ticketData = {};
      sut.ticketData = {};
      await waitFor(() => {
        expect((sut as any).onDataLoad).toBeCalledTimes(3);
      });
    });

    it("reload ticket", async () => {
      (sut as any).onFormInitialize = jest.fn();
      sut.dataUrl = "some-dataUrl";
      sut.launchContext = createMock<TicketData>();

      stubComponent<typeof getTicketData>("getTicketData", "../../packages/kinetix-monza-core/src/TicketHooks.ts", () => of([]));
      await sut.initialize();
      sut.reload();
      await waitFor(() => {
        expect(sut.formInitialized).toBe(false);
        expect((sut as any).onFormInitialize).toBeCalledTimes(1);
        //expect(sut["form"].onFormReset).toBeCalled();
      });
    });

    it("focus on first field", async () => {
      let fields = sut.getFields();
      const firstField = fields[0];
      firstField.model.required = true;
      firstField.model.readonly = false;
      firstField.model.hidden = false;
      firstField.model.disabled = false;
      firstField.focus = jest.fn();
      await sut.formInitialize();
      await sut.initialize();
      await waitFor(() => {
        expect(firstField.focus).toBeCalled();
      });
    });

    it("getFields should return sorted fields", async () => {
      let res = sut.getFields();
      expect(res[0].renderIndex).toBe(1);
      expect(res[1].renderIndex).toBe(2);
      expect(res[2].renderIndex).toBe(3);
    });

    it("build services when reading", async () => {
      arrange(mockContainer)
        .stubMethod("build", () => mockApiClient, [IRestClientType])
        .stubMethod("build", () => mockDialogService, [CoreTypes.IDialogService])
        .stubMethod("build", () => mockMetaDataProvider, [IMetaDataProviderType]);
      sut = new DummyFormViewModel(mockContainer);

      let res = sut.getFields();
      expect(sut.api).toBeDefined();
      expect(sut.dialogService).toBeDefined();
      expect(sut.metaCache).toBeDefined();
    });

    it("getFieldByName should return valid field", async () => {
      let searchedField = sut.getFieldByName("Test2");

      expect(searchedField).not.toBeNull();
      expect(searchedField).not.toBeUndefined();
      expect(searchedField!.renderIndex).toBe(2);
    });

    it("getFieldIndex should return valid field index", async () => {
      let searchedField = sut.getFieldIndex(mockField2);

      expect(searchedField).toBe(2);
    });

    it("if field not exist then update then add field and return the valid index", async () => {
      let newField = createMock<IFormField>();
      newField.renderIndex = -10;
      let searchedField = sut.getFieldIndex(newField);
      expect(searchedField).toBe(1);
    });

    it("should get FormRender", async () => {
      let mockRenderProp = createMock<FormRenderProps>();
      await sut.initialize();
      sut.onFormRender(mockRenderProp);

      sut.onChange("Title", 2);
      sut.onFormReset();

      expect(sut["form"].onChange).toBeCalledWith("Title", { value: 2 });
      expect(sut["form"].onFormReset).toBeCalled();
    });

    it("test OnDialogueCreated", () => {
      let dialogContext = createMock<IDialogContext>();
      let dialogComponent = createMock<IDialogComponent>();

      sut.ticketDialog.canClose = true;
      sut.ticketDialog.title = "My Title";

      sut.OnDialogCreated(dialogContext, dialogComponent);

      expect(dialogContext.canClose).toBe(true);
      expect(dialogContext.title).toBe("My Title");
    });

    it("test formInitialize", async () => {
      sut.ticketData = {
        identifier: {
          ids: [
            {
              id: "My Id",
              domain: "KINETIX",
            },
          ],
        },
      };

      await sut.formInitialize();
      await sut.initialize();
      expect(sut.id?.id).toBe("My Id");
    });

    it("test moveToNextField", async () => {
      let mockTextFocus = jest.spyOn(sut.textField, "focus");
      let mockNumericFocus = jest.spyOn(sut.numericField, "focus");

      sut.textField.model.required = true;
      sut.numericField.model.required = true;

      await sut.formInitialize();

      sut.moveToNextField(0);

      expect(mockTextFocus).toBeCalled();

      sut.moveToNextField(1);

      expect(mockNumericFocus).toBeCalled();
    });

    it("test setRemoteValidationIssues", () => {
      const issues = [
        {
          severity: "Error",
          fullPath: "textField",
          description: "My textField error",
        },
        {
          severity: "Error",
          description: "My non-UI error",
        },
        {
          severity: "Warning",
        },
      ];

      const updateModelMock = jest.spyOn(sut, "updateModel");

      sut.setRemoteValidationIssues(issues);

      expect(updateModelMock).toBeCalled();
      expect(sut.textField.model.customValidation).not.toBeNull();
    });

    it("test onPostTicketDataNext", async () => {
      let mockSetRemoteValidationIssues = jest.spyOn(sut, "setRemoteValidationIssues");

      await sut["onPostTicketDataNext"]({
        value: {
          issues: [
            {
              severity: "Error",
              fullPath: "textField",
              description: "My textField error",
            },
            {
              severity: "Warning",
              fullPath: "textField",
              description: "My textField warning",
            },
          ],
        },
      });

      expect(mockSetRemoteValidationIssues).toBeCalled();

      await sut["onPostTicketDataNext"]({});

      expect(mockDialogService.Close).toBeCalled();
    });

    it("test onPostDataNext", async () => {
      let mockSetRemoteValidationIssues = jest.spyOn(sut, "setRemoteValidationIssues");

      await sut["onPostDataNext"](
        {
          status: "Failure",
          description: "My error",
        },
        "status"
      );

      expect(mockSetRemoteValidationIssues).toBeCalled();

      await sut["onPostDataNext"]({}, "status");

      expect(mockDialogService.Close).toBeCalled();
    });

    it("test onPostData default", async () => {
      arrange(mockApiClient).stubMethod("post", () => apiSubject);

      await sut["onPostData"]({});

      apiSubject.next({});
      apiSubject.error("Test error");
      apiSubject.complete();

      expect(sut.model.customValidation).toBe("Test error");
    });

    it("test onPostData with patch", async () => {
      sut.submitOperation = HttpRequestConfigurations.PATCH;
      arrange(mockApiClient).stubMethod("patch", () => apiSubject);

      await sut["onPostData"]({});

      apiSubject.next({});
      apiSubject.error("Test error");
      apiSubject.complete();

      expect(sut.model.customValidation).toBe("Test error");
    });

    it("test onPostData with put", async () => {
      sut.submitOperation = HttpRequestConfigurations.PUT;
      arrange(mockApiClient).stubMethod("put", () => apiSubject);

      await sut["onPostData"]({});

      apiSubject.next({});
      apiSubject.error("Test error");
      apiSubject.complete();

      expect(sut.model.customValidation).toBe("Test error");
    });
    it("OnDialogCreated should create ticket with the host", async () => {
      let mockDialogContext = createMock<IDialogContext>();
      let mockComponent = createMock<IDialogComponent>();

      sut.OnDialogCreated(mockDialogContext, mockComponent);
      sut.OnDialogClose();
      expect(sut.ticketDialog).not.toBeNull();
    });

    it("setRemoteValidationIssues should setCustomValidation for specific field", async () => {
      let issues = [
        {
          severity: "Error",
          fullPath: "Test2",
          description: "desc",
        },
      ];
      mockField2.label = "label";
      sut.setRemoteValidationIssues(issues);

      expect(mockField2.setCustomValidation).toBeCalledWith("Error:", "label : desc");
    });

    it("setRemoteValidationIssues should setCustomValidation for specific field", async () => {
      console.error = jest.fn();
      let issues = [
        {
          severity: "Error",
          fullPath: "No Path",
          description: "desc",
        },
      ];
      sut.setRemoteValidationIssues(issues);

      expect(console.error).toHaveBeenCalledWith("No Path : desc\n");
    });

    it("setRemoteValidationIssues should setCustomValidation for specific field", async () => {
      let req = {};

      arrange(mockField1).stubMethod("getSubmitValue", () => "val1");
      arrange(mockField2).stubMethod("getSubmitValue", () => "val2");
      arrange(mockField3).stubMethod("getSubmitValue", () => "val3");

      sut.onSubmit(req);

      expect(req).not.toBeNull();
      expect(req).toStrictEqual({ Test1: "val1", Test2: "val2", Test3: "val3" });
    });

    it("setInitialData should getCalled", async () => {
      sut.ticketData = { Test2: "someData" };
      sut.setInitialData();
      let res = await sut.getInitialData();

      expect(sut.InitalData).not.toBeNull();
      expect(sut.InitalData).not.toBeUndefined();
      expect(res).not.toBeNull();
    });

    it("should submit the form", async () => {
      sut.id = { id: "testId", version: "1" };
      sut.dataUrl = "/callThis";
      await sut.submit({ name: "something" });

      expect(sut).not.toBeNull();
    });

    it("should remove form field", () => {
      sut.removeFormField(mockField1);

      expect(sut["formfields"].length).toBe(2);
    });

    it("setFieldMeta should get updated", async () => {
      sut.tickeMeta = {
        fields: {
          Test1: {
            fieldType: "string",
          },
          Test2: {
            fieldType: "string",
          },
          Test3: {
            fieldType: "string",
          },
        },
      };
      await sut.setFieldMeta(mockField1);

      expect(sut).not.toBeNull();
    });
  });
});
