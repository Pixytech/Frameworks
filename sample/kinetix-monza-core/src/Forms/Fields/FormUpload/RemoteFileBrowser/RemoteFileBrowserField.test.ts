// reflect-metadata is required for IOC
import "reflect-metadata";
import { createMock } from "ts-auto-mock";
import { arrange } from "../../../../../../../testing";
import { waitFor } from "@testing-library/react";
import { RemoteFileBrowserField } from "./RemoteFileBrowserField";
import { RemoteFileBrowserModel } from "./RemoteFileBrowserModel";
import { IFormViewModel } from "../../../IFormViewModel";
import { FormModel } from "../../../FormModel";
import { IContainer, IRestClient, IRestClientType } from "@kinetix/core";
import { IRemoteStorageService, IRemoteFile, IRemoteStorageServiceType } from "../Services/IRemoteStorageService";
import { of, throwError } from "rxjs";

// Base Package
describe("Kinetix Monza Core", () => {
  // Testing Component
  describe("RemoteFileBrowserField", () => {
    let sut: RemoteFileBrowserField;
    let mockOwner: IFormViewModel<FormModel>;
    let mockContainer: IContainer;
    let mockApi: IRestClient;
    let mockStorageService: IRemoteStorageService;

    const mockRemoteFiles: IRemoteFile[] = [
      { name: "contract1.pdf", path: "uploads/contract1.pdf", extension: "pdf", icon: "file-pdf" },
      { name: "contract2.docx", path: "uploads/contract2.docx", extension: "docx", icon: "file-word" },
      { name: "document.txt", path: "uploads/document.txt", extension: "txt", icon: "file-text" }
    ];

    beforeEach(() => {
      // Create mocks
      mockContainer = createMock<IContainer>();
      mockOwner = createMock<IFormViewModel<FormModel>>();
      mockApi = createMock<IRestClient>();
      mockStorageService = createMock<IRemoteStorageService>();

      // Setup container to return mocked services
      arrange(mockContainer)
        .stubMethod("build", () => mockApi, [IRestClientType])
        .stubMethod("build", () => mockStorageService, [IRemoteStorageServiceType]);

      // Setup owner with container
      arrange(mockOwner)
        .stubProperty("container", () => mockContainer);

      // Create system under test with all required dependencies
      sut = new RemoteFileBrowserField(mockApi, mockStorageService, mockOwner);
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    describe("Initialization", () => {
      it("Should initialize with default model values", () => {
        expect(sut.model.isOpen).toBe(false);
        expect(sut.model.loading).toBe(false);
        expect(sut.model.files).toEqual([]);
        expect(sut.model.selectedFiles).toEqual([]);
        expect(sut.model.allowMultiple).toBe(false);
        expect(sut.model.error).toBeUndefined();
      });

      it("Should have correct field type", () => {
        expect(sut.type).toBe("RemoteFileBrowserField");
      });
    });

    describe("openBrowser", () => {
      it("Should open browser and set configuration", async () => {
        // Arrange
        const repositoryId = "repo-123";
        const allowMultiple = true;
        const fileFilter = "application/pdf,application/msword";

        arrange(mockStorageService)
          .stubMethod("getUploadsPath", () => of("uploads"));

        arrange(mockStorageService)
          .stubMethod("listFiles", () => of(mockRemoteFiles));

        // Act
        sut.openBrowser(repositoryId, allowMultiple, fileFilter);

        // Assert
        await waitFor(() => {
          expect(sut.model.isOpen).toBe(true);
          expect(sut.model.repositoryId).toBe(repositoryId);
          expect(sut.model.allowMultiple).toBe(allowMultiple);
          expect(sut.model.fileFilter).toBe(fileFilter);
          expect(sut.model.loading).toBe(false);
          expect(sut.model.files.length).toBe(3);
        });
      });

      it("Should handle error when repository ID is missing", async () => {
        // Act
        sut.openBrowser(undefined, false, undefined);

        // Assert
        await waitFor(() => {
          expect(sut.model.loading).toBe(false);
          expect(sut.model.error).toBe("Repository ID is required");
        });
      });

      it("Should handle error when fetching uploads path fails", async () => {
        // Arrange
        const errorMessage = "Failed to get uploads path";
        arrange(mockStorageService)
          .stubMethod("getUploadsPath", () => throwError(() => new Error(errorMessage)));

        // Act
        sut.openBrowser("repo-123", false, undefined);

        // Assert
        await waitFor(() => {
          expect(sut.model.loading).toBe(false);
          expect(sut.model.error).toContain(errorMessage);
          expect(sut.model.files).toEqual([]);
        });
      });

      it("Should handle error when listing files fails", async () => {
        // Arrange
        const errorMessage = "Failed to list files";
        arrange(mockStorageService)
          .stubMethod("getUploadsPath", () => of("uploads"));

        arrange(mockStorageService)
          .stubMethod("listFiles", () => throwError(() => new Error(errorMessage)));

        // Act
        sut.openBrowser("repo-123", false, undefined);

        // Assert
        await waitFor(() => {
          expect(sut.model.loading).toBe(false);
          expect(sut.model.error).toContain(errorMessage);
          expect(sut.model.files).toEqual([]);
        });
      });
    });

    describe("closeBrowser", () => {
      it("Should close browser and reset state", () => {
        // Arrange
        sut.model.isOpen = true;
        sut.model.selectedFiles = ["file1.pdf", "file2.docx"];
        sut.model.error = "Some error";

        // Act
        sut.closeBrowser();

        // Assert
        expect(sut.model.isOpen).toBe(false);
        expect(sut.model.selectedFiles).toEqual([]);
        expect(sut.model.error).toBeUndefined();
      });
    });

    describe("selectFiles", () => {
      beforeEach(() => {
        sut.model.files = mockRemoteFiles;
      });

      it("Should select single file when allowMultiple is false", () => {
        // Arrange
        sut.model.allowMultiple = false;
        const filePaths = ["uploads/contract1.pdf", "uploads/contract2.docx"];

        // Act
        sut.selectFiles(filePaths);

        // Assert
        expect(sut.model.selectedFiles).toEqual(["uploads/contract1.pdf"]);
      });

      it("Should select multiple files when allowMultiple is true", () => {
        // Arrange
        sut.model.allowMultiple = true;
        const filePaths = ["uploads/contract1.pdf", "uploads/contract2.docx"];

        // Act
        sut.selectFiles(filePaths);

        // Assert
        expect(sut.model.selectedFiles).toEqual(filePaths);
      });

      it("Should handle empty file selection", () => {
        // Arrange
        sut.model.selectedFiles = ["existing.pdf"];

        // Act
        sut.selectFiles([]);

        // Assert
        expect(sut.model.selectedFiles).toEqual([]);
      });
    });

    describe("confirmSelection", () => {
      it("Should return selected files and close browser", () => {
        // Arrange
        const selectedFiles = ["uploads/contract1.pdf", "uploads/contract2.docx"];
        sut.model.isOpen = true;
        sut.model.selectedFiles = selectedFiles;

        // Act
        const result = sut.confirmSelection();

        // Assert
        expect(result).toEqual(selectedFiles);
        expect(sut.model.isOpen).toBe(false);
        // Note: In the current implementation, confirmSelection() calls closeBrowser(true) 
        // which preserves the selection, so selectedFiles should still contain the files
        expect(sut.model.selectedFiles).toEqual(selectedFiles);
      });
    });

    describe("Model change notifications", () => {
      it("Should trigger model change notification when files are loaded", async () => {
        // Arrange
        const modelChangedSpy = jest.fn();
        sut.onModelChanged.subscribe(modelChangedSpy);

        arrange(mockStorageService)
          .stubMethod("getUploadsPath", () => of("uploads"));

        arrange(mockStorageService)
          .stubMethod("listFiles", () => of(mockRemoteFiles));

        // Act
        sut.openBrowser("repo-123", false, undefined);

        // Assert
        await waitFor(() => {
          expect(modelChangedSpy).toHaveBeenCalled();
        });
      });
    });
  });
});