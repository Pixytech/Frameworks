// reflect-metadata is required for IOC
import "reflect-metadata";
import React from "react";
import { cleanup, render, fireEvent, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { createMock } from "ts-auto-mock";

import { CoreTypes, IContainer, IViewModelBase, IViewResolver } from "@kinetix/core";
import { arrange, arrangeViewModel, hostComponent } from "../../../../../../testing";
import { TicketLayout } from "../../TicketLayout";
import { FormModel } from "../../FormModel";
import { FormViewModel } from "../../FormViewModel";

import { FormUpload } from "./FormUpload";
import { FormUploadField } from "./FormUploadField";
import { FormUploadModel, UploadStatus } from "./FormUploadModel";

// Base Package
describe("Kinetix Monza Core", () => {
  // Scoped modulecls

  let mockticketModel: FormViewModel<FormModel>;
  let mockFormUploadField: FormUploadField;
  let mockViewResolver: IViewResolver;
  let mockContainer: IContainer;

  beforeEach(() => {
    mockContainer = createMock<IContainer>();
    mockticketModel = createMock<FormViewModel<FormModel>>({ model: new (class m extends FormModel {})() });
    mockFormUploadField = createMock<FormUploadField>({
      model: new FormUploadModel(),
    });

    arrangeViewModel(mockFormUploadField as any)
      .acceptModelChanges()
      .acceptViewChanges()
      .stubProperty("uploadField", () => mockFormUploadField);

    mockViewResolver = createMock<IViewResolver>();

    arrange(mockContainer).stubMethod("build", () => mockViewResolver, [CoreTypes.IViewResolver]);
  });

  // Note: running cleanup afterEach is done automatically for you in @testing-library/react@9.0.0 or higher
  // unmount and cleanup DOM after the test is finished.
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  // Testing Component
  describe("FormUpload", () => {
    it("Single file upload", async () => {
      let sut = hostComponent(
        <TicketLayout viewModel={mockticketModel}>
          <FormUpload label="Test-Upload" acceptAllFileTypes={true} dataContext={mockFormUploadField} />
        </TicketLayout>,
        mockContainer
      );

      render(sut);

      expect(screen.getByText("Test-Upload")).toBeInTheDocument();
      expect(screen.getByTestId("uploadFileInput")).toHaveAttribute("accept", ".pdf");
      expect(screen.getByTestId("uploadFileInput")).toHaveAttribute("title", "Select a document to upload");
    });

    it("Multi file upload", async () => {
      let sut = hostComponent(
        <TicketLayout viewModel={mockticketModel}>
          <FormUpload label="Test-Upload" accept="a,b,c" multiple={true} dataContext={mockFormUploadField} />
        </TicketLayout>,
        mockContainer
      );

      render(sut);

      expect(screen.getByText("Test-Upload")).toBeInTheDocument();
      expect(screen.getByTestId("uploadFileInput")).toHaveAttribute("accept", "a,b,c");
      expect(screen.getByTestId("uploadFileInput")).toHaveAttribute("multiple");
      expect(screen.getByTestId("uploadFileInput")).toHaveAttribute("title", "Select a document to upload");
    });

    it("props in view took priority", async () => {
      let sut = hostComponent(
        <TicketLayout viewModel={mockticketModel}>
          <FormUpload label="Test-Upload" accept="1,2,3" multiple={true} uploadResultPath="test.value" uploadUrl="upload.testUrl" title="test-title" dataContext={mockFormUploadField} />
        </TicketLayout>,
        mockContainer
      );

      render(sut);

      expect(mockFormUploadField.model.accept).toBe("1,2,3");
      expect(mockFormUploadField.model.multiple).toBe(true);
      expect(mockFormUploadField.model.uploadResultPath).toBe("test.value");
      expect(mockFormUploadField.model.uploadUrl).toBe("upload.testUrl");
      expect(mockFormUploadField.model.title).toBe("test-title");
    });

    it("should invoke handle file select", async () => {
      let sut = hostComponent(
        <TicketLayout viewModel={mockticketModel}>
          <FormUpload label="Test-Upload" dataContext={mockFormUploadField} />
        </TicketLayout>,
        mockContainer
      );

      render(sut);

      fireEvent.change(screen.getByTestId("uploadFileInput"));

      expect(mockFormUploadField.handleFileSelect).toBeCalled();
    });

    it("should invoke reset", async () => {
      mockFormUploadField.model.status = UploadStatus.ERROR;
      mockFormUploadField.model.error = "SOME_ERROR";
      let sut = hostComponent(
        <TicketLayout viewModel={mockticketModel}>
          <FormUpload label="Test-Upload" accept="a,b,c" multiple={true} dataContext={mockFormUploadField} />
        </TicketLayout>,
        mockContainer
      );

      const view = render(sut);
      const fileInputField = view.getByTestId("uploadFileInput")! as HTMLInputElement;

      fireEvent.click(screen.getByTestId("reset"));
      expect(mockFormUploadField.reset).toBeCalled();
      expect(fileInputField.value).toBe("");
    });

    it("should render uploading State", async () => {
      const mockFile1 = createMock<File>({ name: "file1" });

      mockFormUploadField.model.files = [mockFile1];

      mockFormUploadField.model.status = UploadStatus.UPLOADING;

      let sut = hostComponent(
        <TicketLayout viewModel={mockticketModel}>
          <FormUpload label="Test-Upload" accept="a,b,c" multiple={true} dataContext={mockFormUploadField} />
        </TicketLayout>,
        mockContainer
      );

      render(sut);

      expect(screen.getByText("Uploading document...")).toBeInTheDocument();
    });

    it("should render success State", async () => {
      const mockFile1 = createMock<File>({ name: "file1" });

      mockFormUploadField.model.files = [mockFile1];

      mockFormUploadField.model.status = UploadStatus.SUCCESS;

      let sut = hostComponent(
        <TicketLayout viewModel={mockticketModel}>
          <FormUpload label="Test-Upload" accept="a,b,c" multiple={true} dataContext={mockFormUploadField} />
        </TicketLayout>,
        mockContainer
      );

      render(sut);

      expect(screen.getByText("file1")).toBeInTheDocument();
    });

    it("should render error State", async () => {
      mockFormUploadField.model.status = UploadStatus.ERROR;
      mockFormUploadField.model.error = "SOME_ERROR";
      let sut = hostComponent(
        <TicketLayout viewModel={mockticketModel}>
          <FormUpload label="Test-Upload" accept="a,b,c" multiple={true} dataContext={mockFormUploadField} />
        </TicketLayout>,
        mockContainer
      );

      render(sut);

      expect(screen.getByText("Error: SOME_ERROR")).toBeInTheDocument();
    });
  });
});
