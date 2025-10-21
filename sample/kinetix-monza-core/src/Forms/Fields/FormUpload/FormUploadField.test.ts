// reflect-metadata is required for IOC
import "reflect-metadata";
import { FormUploadField,  UploadStatus, UploadMode } from "..";
import { IFormViewModel } from "../../IFormViewModel";
import { FormModel } from "../../FormModel";
import { createMock } from "ts-auto-mock";
import { CoreTypes, IContainer, IDialogService, IRestClient, IRestClientType } from "@kinetix/core";
import { arrange } from "../../../../../../testing";
import { of } from "rxjs";
import { waitFor } from "@testing-library/react";
import { PdfFilePopup } from "./FileViewers/PdfFilePopup";

// Base Package
describe("Kinetix Monza Core", () => {
  // Testing Component
  describe("FormUploadField", () => {
    let sut: FormUploadField;
    let mockOwner: IFormViewModel<FormModel>;
    let mockContainer: IContainer;
    let mockRestClient: IRestClient;
    beforeEach(() => {
      mockOwner = createMock<IFormViewModel<FormModel>>({ model: new (class s extends FormModel {})() });
      mockContainer = createMock<IContainer>();
      mockRestClient = createMock<IRestClient>();
      arrange(mockOwner).stubProperty("container", () => mockContainer);
      arrange(mockContainer).stubMethod("build", () => mockRestClient, [IRestClientType]);

      sut = new FormUploadField(mockOwner);
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it("Should rest to default values", async () => {
      await sut.initialize();

      const reset = { stopPropagation: jest.fn() };
      sut.reset(reset);
      expect(sut.model.status).toBe(UploadStatus.PENDING);
      expect(sut.model.files.length).toBe(0);
      expect(reset.stopPropagation).toBeCalled();
    });

    it("Should set values", async () => {
      await sut.initialize();

      sut.setValue("https://someserver/someFile.pdf")
      expect(sut.model.status).toBe(UploadStatus.SUCCESS);
      expect(sut.model.files.length).toBe(1);
    });

    it("Should throw error on invalid file", async () => {
      await sut.initialize();

      const file1 = createMock<File>({ name: "file1", type: "xyz" });
      sut.handleFileSelect([file1]);
      expect(sut.model.error).toBe('Error:File type "xyz" not allowed');
    });

    it("Should upload files", async () => {
      arrange(mockRestClient).stubMethod("post", () => of({ status: "Success", description: "file uploaded", a: { b: { c: "SOME-DATA" } } }));
      sut.model.uploadUrl = "test-upload-url";
      sut.model.uploadResultPath = "a.b.c";
      sut.model.fileTypes = ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
      await sut.initialize();

      const file1 = createMock<File>({ name: "file1", type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });

      await sut.handleFileSelect([file1]);

      await waitFor(() => {
        expect(sut.model.value).toBe("SOME-DATA");
        expect(sut.model.status).toBe(UploadStatus.SUCCESS);
      });
    });

    it("Should create popup to view uploaded PDF files", async () => {
      const mockDialogService = createMock<IDialogService>();
      const pdfFilePopup = createMock<PdfFilePopup>();
      arrange(mockContainer)
      .stubMethod("build",()=>mockDialogService,[CoreTypes.IDialogService])
      .stubMethod("build",()=>pdfFilePopup,[PdfFilePopup]);
      
      sut.model.value = "uploadedFilePath.pdf"
      await sut.viewUploadedFile("someFileName.pdf",0);

      expect(pdfFilePopup.formInitialize).toBeCalled();
      expect(mockDialogService.ShowDialog).toBeCalled();
    })

    it("Should show upload error", async () => {
      arrange(mockRestClient).stubMethod("post", () => of({ status: "Error", description: "server-error", a: { b: { c: "SOME-DATA" } } }));
      await sut.initialize();

      sut.model.uploadUrl = "test-upload-url";
      sut.model.uploadResultPath = "a.b.c";

      const file1 = createMock<File>({ name: "file1", type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });

      await sut.handleFileSelect([file1]);

      expect(sut.model.status).toBe(UploadStatus.ERROR);
      expect(sut.model.value).toBe(undefined);
      expect(sut.model.error).toBe('Error:File type "application/vnd.openxmlformats-officedocument.wordprocessingml.document" not allowed');
    });

    it("Should upload on drag drop - items field", async () => {
      const file1 = createMock<File>({ name: "file1", type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });

      const dataTransferItem = createMock<DataTransferItem>({ getAsFile: () => file1, kind: "file" });

      const onChange = jest.fn(() => {});
      const uploadFiles = jest.spyOn(sut, "uploadFiles");

      await sut.initialize();
      sut.onFilesChange = onChange;

      await sut.handleDrop({ preventDefault: jest.fn(() => {}), dataTransfer: { items: [dataTransferItem] } });

      expect(uploadFiles).toBeCalledWith([file1]);
      expect(onChange).toBeCalled();
    });

    it("Should upload on drag drop - files field", async () => {
      const file1 = createMock<File>({ name: "file1", type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });

      const onChange = jest.fn(() => {});
      const uploadFiles = jest.spyOn(sut, "uploadFiles");

      await sut.initialize();
      sut.onFilesChange = onChange;

      await sut.handleDrop({ preventDefault: jest.fn(() => {}), dataTransfer: { items: [], files: [file1] } });

      expect(uploadFiles).toBeCalledWith([file1]);
      expect(onChange).toBeCalled();
    });

    // UploadMode enum tests
    describe("UploadMode enum functionality", () => {
      it("Should default to LOCAL mode", async () => {
        await sut.initialize();
        expect(sut.model.mode).toBe(UploadMode.LOCAL);
      });

      it("Should allow setting CLOUD mode", async () => {
        await sut.initialize();
        sut.model.mode = UploadMode.CLOUD;
        expect(sut.model.mode).toBe(UploadMode.CLOUD);
      });

      it("Should handle file select differently based on mode", async () => {
        const file1 = createMock<File>({ name: "file1", type: "application/pdf" });
        const uploadFiles = jest.spyOn(sut, "uploadFiles");
        const consoleSpy = jest.spyOn(console, "debug").mockImplementation(() => {});

        // Test LOCAL mode
        sut.model.mode = UploadMode.LOCAL;
        await sut.handleFileSelect([file1]);
        expect(uploadFiles).toHaveBeenCalledWith([file1]);

        // Test CLOUD mode
        uploadFiles.mockClear();
        sut.model.mode = UploadMode.CLOUD;
        await sut.handleFileSelect([file1]);
        expect(uploadFiles).not.toHaveBeenCalled();
        expect(consoleSpy).toHaveBeenCalledWith("Cloud mode file select - use openCloudFileBrowser instead");

        consoleSpy.mockRestore();
      });
    });

    // Cloud file functionality tests
    describe("Cloud file functionality", () => {
      let mockStorageService: any;
      
      beforeEach(() => {
        sut.model.mode = UploadMode.CLOUD;
        
        // Create and inject mock storage service
        mockStorageService = {
          uploadRemoteFiles: jest.fn()
        };
        (sut as any).storageService = mockStorageService;
      });

      it("Should initialize with empty cloud files", async () => {
        await sut.initialize();
        expect(sut.model.selectedCloudFiles).toEqual([]);
        expect(sut.model.repositoryId).toBeUndefined();
      });

      it("Should select cloud files correctly", async () => {
        // Setup required model properties
        sut.model.repositoryId = "test-repo";
        sut.model.destinationFolderPath = "Contracts";
        sut.model.cloudStorageConfig = { uploadsPath: "uploads" };
        
        const filePaths = ["path1/file1.pdf", "path2/file2.pdf"];
        const onCloudFilesChangeInternal = jest.spyOn(sut, "onCloudFilesChangeInternal");
        
        // Mock the storage service response
        const mockResult = { value: [{ value: { batchId: "test-batch-123" } }] };
        mockStorageService.uploadRemoteFiles.mockReturnValue(of(mockResult));

        await sut.selectCloudFiles(filePaths);
        
        // Wait for async operations
        await waitFor(() => {
          expect(sut.model.selectedCloudFiles).toEqual(filePaths);
          expect(sut.model.status).toBe(UploadStatus.SUCCESS);
          expect(sut.model.value).toEqual(mockResult);
          expect(sut.model.files).toHaveLength(2);
          expect(sut.model.files[0].name).toBe("file1.pdf");
          expect(sut.model.files[1].name).toBe("file2.pdf");
          expect(onCloudFilesChangeInternal).toHaveBeenCalledWith(filePaths);
        });
      });

      it("Should handle single file selection in non-multiple mode", async () => {
        // Setup required model properties
        sut.model.multiple = false;
        sut.model.repositoryId = "test-repo";
        sut.model.destinationFolderPath = "Contracts";
        sut.model.cloudStorageConfig = { uploadsPath: "uploads" };
        
        // Mock the storage service uploadRemoteFiles method
        const mockResult = { value: [{ value: { batchId: "test-batch-123" } }] };
        mockStorageService.uploadRemoteFiles.mockReturnValue(of(mockResult));
        
        const filePaths = ["path1/file1.pdf"];

        await sut.selectCloudFiles(filePaths);

        // Wait for async operations to complete
        await waitFor(() => {
          expect(sut.model.status).toBe(UploadStatus.SUCCESS);
          expect(sut.model.files).toHaveLength(1);
          expect(sut.model.files[0].name).toBe("file1.pdf");
          expect(sut.model.selectedCloudFiles).toEqual(filePaths);
        });
      });

      it("Should trigger onCloudFilesChange callback if provided", async () => {
        const callback = jest.fn();
        sut.onCloudFilesChange = callback;
        const filePaths = ["path1/file1.pdf"];

        sut.onCloudFilesChangeInternal(filePaths);

        expect(callback).toHaveBeenCalledWith(filePaths);
      });

      it("Should handle openCloudFileBrowser call", async () => {
        // Mock the dialog service
        const mockDialogService = {
          ShowDialog: jest.fn().mockResolvedValue(false)
        };
        
        // Mock the remote file browser
        const mockRemoteFileBrowser = {
          openBrowser: jest.fn(),
          model: { selectedFiles: [] },
          closeBrowser: jest.fn(),
          getAndClearSelectedFiles: jest.fn().mockReturnValue([]) // Mock this method even if it doesn't exist in the implementation
        };
        
        // Setup container to return dialog service when asking for IDialogService
        arrange(mockContainer)
          .stubMethod("build", () => mockDialogService, [CoreTypes.IDialogService]);
        
        // Inject the mock remote file browser
        (sut as any).remoteFileBrowser = mockRemoteFileBrowser;

        await sut.openCloudFileBrowser();

        // Verify the browser was opened with correct parameters
        expect(mockRemoteFileBrowser.openBrowser).toHaveBeenCalledWith(
          sut.model.repositoryId,
          false, // Always single-select for remote file browser
          sut.model.acceptAllFileTypes ? undefined : sut.model.fileTypes.join(',')
        );
        
        // Verify dialog was shown
        expect(mockDialogService.ShowDialog).toHaveBeenCalledWith(mockRemoteFileBrowser, {});
      });
    });
  });
});
