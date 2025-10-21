import { IocInject, IocInjectable, IRestClientType, type IRestClient, IDialogAware, IDialogContext, IDialogComponent } from "@kinetix/core";
import { FormField } from "../../FormField";
import { RemoteFileBrowserModel } from "./RemoteFileBrowserModel";
import { IRemoteFile, IRemoteStorageServiceType, type IRemoteStorageService } from "../Services/IRemoteStorageService";
import { FormModel } from "../../../FormModel";
import type { IFormViewModel } from "../../../IFormViewModel";

@IocInjectable()
export class RemoteFileBrowserField extends FormField<RemoteFileBrowserModel> implements IDialogAware {
  
  public readonly type: string = "RemoteFileBrowserField";

  constructor(
    @IocInject(IRestClientType) private readonly api: IRestClient,
    @IocInject(IRemoteStorageServiceType) private readonly storageService: IRemoteStorageService,
    owner: IFormViewModel<FormModel>
  ) {
    super(owner);
  }

  protected createModel(): RemoteFileBrowserModel {
    const model = new RemoteFileBrowserModel();
    return model;
  }

  /**
   * Opens the remote file browser dialog
   * @param repositoryId the repository ID for file access
   * @param allowMultiple whether to allow multiple file selection
   * @param fileFilter optional file extension filter
   */
  openBrowser(repositoryId?: string, allowMultiple: boolean = false, fileFilter?: string): void {
    this.updateModel((m) => {
      m.repositoryId = repositoryId;
      m.allowMultiple = allowMultiple;
      m.fileFilter = fileFilter;
      m.isOpen = true;
      m.loading = true;
      m.error = undefined;
    });

    this.fetchRemoteFiles();
  }

  /**
   * Closes the remote file browser dialog
   * @param preserveSelection whether to preserve the selected files (used when confirming)
   */
  closeBrowser(preserveSelection: boolean = false): void {
    this.updateModel((m) => {
      m.isOpen = false;
      if (!preserveSelection) {
        m.selectedFiles = [];
      }
      m.error = undefined;
    });
  }

  /**
   * Handles file selection in the browser
   * @param filePaths array of selected file paths
   */
  selectFiles(filePaths: string[]): void {
    console.log('[RemoteFileBrowserField] selectFiles called with:', filePaths);
    const selectedPaths = this.model.allowMultiple ? filePaths : filePaths.slice(0, 1);
    console.log('[RemoteFileBrowserField] allowMultiple:', this.model.allowMultiple, 'selectedPaths:', selectedPaths);
    this.updateModel((m) => {
      m.selectedFiles = [...selectedPaths];
      console.log('[RemoteFileBrowserField] Model updated, selectedFiles now:', m.selectedFiles);
    });
  }

  /**
   * Confirms file selection and closes browser
   * @returns selected file paths
   */
  confirmSelection(): string[] {
    const selectedFiles = [...this.model.selectedFiles];
    this.closeBrowser(true); // Preserve selection when confirming
    return selectedFiles;
  }

  /**
   * Fetches available remote files from the API
   */
  private fetchRemoteFiles(): void {
    
    if (!this.model.repositoryId) {
      this.updateModel((m) => {
        m.loading = false;
        m.error = "Repository ID is required";
      });
      return;
    }

    // Get uploads path from repository configuration
    this.storageService.getUploadsPath(this.model.repositoryId).subscribe({
      next: (uploadsPath) => {
        // List files at the uploads path
        this.storageService.listFiles(uploadsPath).subscribe({
          next: (remoteFiles) => {
            // Filter files if file filter is specified
            let filteredFiles = remoteFiles;
            if (this.model.fileFilter && this.model.fileFilter.trim() !== '') {
              // For now, just show all files regardless of filter
              // The filter contains MIME types but we need to properly map them
              filteredFiles = remoteFiles;
              
              // TODO: Implement proper MIME type to extension mapping
              // const allowedExtensions: string[] = [];
              // const filters = this.model.fileFilter.split(',').map(f => f.trim().toLowerCase());
              // ... filtering logic ...
            }
            
            this.updateModel((m) => {
              m.loading = false;
              m.files = [...filteredFiles]; // Ensure new array reference
              m.error = undefined;
            });
            
            // Force a model change notification
            this.notifyModelChanged();
          },
          error: (error: any) => {
            console.error("Failed to fetch remote files", error);
            this.updateModel((m) => {
              m.loading = false;
              m.error = error.message || `Failed to load remote files: ${error}`;
              m.files = [];
            });
          }
        });
      },
      error: (error: any) => {
        console.error("Failed to get uploads path", error);
        this.updateModel((m) => {
          m.loading = false;
          m.error = error.message || `Failed to get uploads path: ${error}`;
          m.files = [];
        });
      }
    });
  }

  /**
   * IDialogAware implementation
   */
  OnDialogCreated(context: IDialogContext, dialogComponent?: IDialogComponent): void {
    context.title = "Browse Storage Files";
    context.initialWidth = 800;
    context.initialHeight = 600;
    context.canClose = true;
    context.isModel = true; // Modal dialog
    context.draggable = true;
    context.resizable = true;
    context.canMaximize = false;
    context.canMinimize = false;
  }

  OnDialogClose(): void {
    // Clean up when dialog closes
    // Don't clear selected files here - let the dialog result handling decide
    console.log('[RemoteFileBrowserField] OnDialogClose called, preserving selectedFiles');
  }

  /**
   * Gets the currently selected files and clears the selection
   * @returns array of selected file paths
   */
  getAndClearSelectedFiles(): string[] {
    const selectedFiles = [...this.model.selectedFiles];
    console.log('[RemoteFileBrowserField] getAndClearSelectedFiles returning:', selectedFiles);
    this.closeBrowser(); // This will clear the selection
    return selectedFiles;
  }
}