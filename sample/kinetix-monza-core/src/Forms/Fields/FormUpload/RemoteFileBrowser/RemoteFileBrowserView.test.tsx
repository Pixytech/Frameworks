// reflect-metadata is required for IOC
import "reflect-metadata";
import React from "react";
import { createMock } from "ts-auto-mock";
import { cleanup, fireEvent, render, screen, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { RemoteFileBrowserView } from "./RemoteFileBrowserView";
import { RemoteFileBrowserField } from "./RemoteFileBrowserField";
import { RemoteFileBrowserModel } from "./RemoteFileBrowserModel";
import { clearStubs, hostComponent, stubComponent } from "../../../../../../../testing";
import { Grid, GridColumnProps, GridCustomCellProps } from "@progress/kendo-react-grid";
import { IRemoteFile } from "../Services/IRemoteStorageService";
import { IContainer } from "@kinetix/core";
import { IFormViewModel } from "../../../IFormViewModel";
import { FormModel } from "../../../FormModel";

// Base Package
describe("Kinetix Monza Core", () => {
  // Testing Component
  describe("RemoteFileBrowserView", () => {
    let mockField: RemoteFileBrowserField;
    let mockDialogService: { Close: jest.Mock };

    const mockRemoteFiles: IRemoteFile[] = [
      { name: "contract1.pdf", path: "uploads/contract1.pdf", extension: "pdf", icon: "file-pdf" },
      { name: "contract2.docx", path: "uploads/contract2.docx", extension: "docx", icon: "file-word" },
      { name: "document.txt", path: "uploads/document.txt", extension: "txt", icon: "file-text" }
    ];

    beforeEach(() => {
      // Create mocks
      mockField = createMock<RemoteFileBrowserField>({ model: new RemoteFileBrowserModel() });
      
      // Setup default model state
      mockField.model.isOpen = true;
      mockField.model.files = mockRemoteFiles;
      mockField.model.repositoryId = "repo-123";
      mockField.model.selectedFiles = [];
      mockField.model.allowMultiple = false;
      mockField.model.loading = false;

      // Mock methods
      mockField.selectFiles = jest.fn();
      mockField.confirmSelection = jest.fn();
      mockField.closeBrowser = jest.fn();
      
      // Mock Owner with container and dialog service
      mockDialogService = {
        Close: jest.fn()
      };
      mockField.Owner = createMock<IFormViewModel<FormModel>>({
        container: createMock<IContainer>({
          build: jest.fn().mockReturnValue(mockDialogService)
        })
      });

      // Stub Kendo Grid to simplify testing
      const mockSelectionCell = createMock<GridCustomCellProps>({ dataItem: mockRemoteFiles[0], field: "selection" });
      const mockFileCell = createMock<GridCustomCellProps>({ dataItem: mockRemoteFiles[0], field: "name" });
      
      stubComponent<typeof Grid>("Grid", "@progress/kendo-react-grid", (props) => {
        const columns = props.children ? React.Children.toArray(props.children) : [];
        const selectionColumn = columns[0] as React.ReactElement<GridColumnProps>;
        const fileColumn = columns[1] as React.ReactElement<GridColumnProps>;
        
        // Get header and cell renderers
        const headerCell = selectionColumn?.props?.headerCell as (() => JSX.Element) | undefined;
        const selectionCell = selectionColumn?.props?.cell as ((e: GridCustomCellProps) => JSX.Element) | undefined;
        const fileCell = fileColumn?.props?.cell as ((e: GridCustomCellProps) => JSX.Element) | undefined;
        
        return (
          <div className="k-grid">
            {/* Render header if needed */}
            {headerCell && (
              <div role="row" className="k-grid-header">
                {headerCell()}
              </div>
            )}
            {/* Render file list */}
            {mockField.model.files.map((file, index) => (
              <div 
                key={index} 
                role="row" 
                onClick={(e) => {
                  // Simulate row click if onRowClick is provided
                  if (props.onRowClick && e.target instanceof HTMLElement && e.target.tagName !== 'INPUT') {
                    props.onRowClick({ dataItem: file, nativeEvent: e } as any);
                  }
                }}
              >
                {selectionCell && selectionCell({ ...mockSelectionCell, dataItem: file })}
                <div>{file.name}</div>
              </div>
            ))}
          </div>
        );
      });
    });

    afterEach(() => {
      cleanup();
      jest.resetAllMocks();
      clearStubs();
    });

    // Basic smoke test to ensure setup works
    it("component should be created", () => {
      const sut = hostComponent(<RemoteFileBrowserView field={mockField} />);
      const view = render(sut);
      expect(view).not.toBeNull();
    });

    describe("Rendering Tests", () => {
      it("should show loading state", () => {
        mockField.model.loading = true;
        
        const sut = hostComponent(<RemoteFileBrowserView field={mockField} />);
        render(sut);
        
        expect(screen.getByText("Loading remote files...")).toBeInTheDocument();
      });

      it("should display error message", () => {
        const errorMessage = "Failed to load files";
        mockField.model.loading = false;
        mockField.model.error = errorMessage;
        
        const sut = hostComponent(<RemoteFileBrowserView field={mockField} />);
        render(sut);
        
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });

      it("should display all file names", () => {
        mockField.model.loading = false;
        mockField.model.error = undefined;
        
        const sut = hostComponent(<RemoteFileBrowserView field={mockField} />);
        render(sut);
        
        // Check if all file names are rendered
        mockRemoteFiles.forEach(file => {
          expect(screen.getByText(file.name)).toBeInTheDocument();
        });
      });
    });

    describe("File Selection Tests", () => {
      it("should handle single file selection (radio button mode)", () => {
        mockField.model.allowMultiple = false;
        
        const sut = hostComponent(<RemoteFileBrowserView field={mockField} />);
        render(sut);
        
        // Click on the first file's radio button
        const firstRadio = screen.getByTestId("fileSelect-contract1-pdf");
        fireEvent.click(firstRadio);
        
        expect(mockField.selectFiles).toHaveBeenCalledWith([mockRemoteFiles[0].path]);
      });

      it("should handle single file selection by row click", () => {
        mockField.model.allowMultiple = false;
        
        const sut = hostComponent(<RemoteFileBrowserView field={mockField} />);
        render(sut);
        
        // Click on the first file row
        const firstFileRow = screen.getByText(mockRemoteFiles[0].name).closest("div[role='row']");
        fireEvent.click(firstFileRow!);
        
        expect(mockField.selectFiles).toHaveBeenCalledWith([mockRemoteFiles[0].path]);
      });

      it("should deselect previous file when selecting new file in single mode", () => {
        mockField.model.allowMultiple = false;
        mockField.model.selectedFiles = [mockRemoteFiles[0].path];
        
        const sut = hostComponent(<RemoteFileBrowserView field={mockField} />);
        render(sut);
        
        // Click on the second file
        const secondRadio = screen.getByTestId("fileSelect-contract2-docx");
        fireEvent.click(secondRadio);
        
        // Should replace the selection, not add to it
        expect(mockField.selectFiles).toHaveBeenCalledWith([mockRemoteFiles[1].path]);
      });

      it("should handle multiple file selection (checkbox mode)", () => {
        mockField.model.allowMultiple = true;
        
        const sut = hostComponent(<RemoteFileBrowserView field={mockField} />);
        render(sut);
        
        // Test that clicking checkboxes calls selectFiles with correct paths
        const firstCheckbox = screen.getByTestId("fileSelect-contract1-pdf");
        fireEvent.click(firstCheckbox);
        
        expect(mockField.selectFiles).toHaveBeenCalledTimes(1);
        expect(mockField.selectFiles).toHaveBeenCalledWith([mockRemoteFiles[0].path]);
        
        // Clear mocks for next assertion
        (mockField.selectFiles as jest.Mock).mockClear();
        
        // Click second checkbox - it will only contain the second file since component state is isolated
        const secondCheckbox = screen.getByTestId("fileSelect-contract2-docx");
        fireEvent.click(secondCheckbox);
        
        expect(mockField.selectFiles).toHaveBeenCalledTimes(1);
        expect(mockField.selectFiles).toHaveBeenCalledWith([mockRemoteFiles[1].path]);
      });

      it("should deselect files in multiple mode", () => {
        mockField.model.allowMultiple = true;
        // Start with files pre-selected
        mockField.model.selectedFiles = [mockRemoteFiles[0].path, mockRemoteFiles[1].path];
        
        const sut = hostComponent(<RemoteFileBrowserView field={mockField} />);
        render(sut);
        
        // The checkboxes should be checked initially
        const firstCheckbox = screen.getByTestId("fileSelect-contract1-pdf") as HTMLInputElement;
        expect(firstCheckbox.checked).toBe(true);
        
        // Click to deselect first file
        fireEvent.click(firstCheckbox);
        
        // Should call selectFiles without the first file
        expect(mockField.selectFiles).toHaveBeenCalledWith([mockRemoteFiles[1].path]);
      });

      it("should toggle selection on row click", () => {
        mockField.model.allowMultiple = true;
        mockField.model.selectedFiles = [mockRemoteFiles[0].path];
        
        const sut = hostComponent(<RemoteFileBrowserView field={mockField} />);
        render(sut);
        
        // Click on already selected file row
        const firstFileRow = screen.getByText(mockRemoteFiles[0].name).closest("div[role='row']");
        fireEvent.click(firstFileRow!);
        
        // Should deselect the file
        expect(mockField.selectFiles).toHaveBeenCalledWith([]);
      });

      it("should handle select all when allowMultiple is true", () => {
        mockField.model.allowMultiple = true;
        
        const sut = hostComponent(<RemoteFileBrowserView field={mockField} />);
        render(sut);
        
        // Click select all checkbox
        const selectAllCheckbox = screen.getByTestId("selectAllFiles");
        fireEvent.click(selectAllCheckbox);
        
        // Should select all files
        expect(mockField.selectFiles).toHaveBeenCalledWith(
          mockRemoteFiles.map(file => file.path)
        );
      });

      it("should handle deselect all when all files are selected", () => {
        mockField.model.allowMultiple = true;
        mockField.model.selectedFiles = mockRemoteFiles.map(file => file.path);
        
        const sut = hostComponent(<RemoteFileBrowserView field={mockField} />);
        render(sut);
        
        // Click select all checkbox (which should now deselect all)
        const selectAllCheckbox = screen.getByTestId("selectAllFiles");
        fireEvent.click(selectAllCheckbox);
        
        // Should deselect all files
        expect(mockField.selectFiles).toHaveBeenCalledWith([]);
      });
    });

    describe("Dialog Action Tests", () => {
      it("should close dialog with cancel when Cancel button is clicked", () => {
        const sut = hostComponent(<RemoteFileBrowserView field={mockField} />);
        render(sut);
        
        const cancelButton = screen.getByRole("button", { name: /Cancel/i });
        fireEvent.click(cancelButton);
        
        // Verify dialog service was called to close with cancel (false)
        expect(mockDialogService.Close).toHaveBeenCalledWith(mockField, false);
      });

      it("should close dialog with success when Select button is clicked with files selected", () => {
        mockField.model.selectedFiles = [mockRemoteFiles[0].path];
        
        const sut = hostComponent(<RemoteFileBrowserView field={mockField} />);
        render(sut);
        
        const selectButton = screen.getByRole("button", { name: /Select \(1\)/i });
        fireEvent.click(selectButton);
        
        // Verify dialog service was called to close with success (true)
        expect(mockDialogService.Close).toHaveBeenCalledWith(mockField, true);
      });

      it("should disable Select button when no files are selected", () => {
        mockField.model.selectedFiles = [];
        
        const sut = hostComponent(<RemoteFileBrowserView field={mockField} />);
        render(sut);
        
        const selectButton = screen.getByRole("button", { name: /Select/i });
        expect(selectButton).toBeDisabled();
      });
    });

  });
});