import { FormField } from "../FormField";
import { FormUploadModel, UploadStatus, UploadMode } from "./FormUploadModel";
import { ApiResponseType, CoreTypes, IDialogService, IRestClient, IRestClientType, type IDialogService as IDialogServiceType } from "@kinetix/core";
import { get } from "lodash";
import { IFormViewModel } from "../../IFormViewModel";
import { FormModel } from "../../FormModel";
import { Observable } from "rxjs";
import { ValidationHelper } from "../ValidationHelper";
import { ValidationType } from "../ValidationType";
import { launchDocumentViewer, PdfFilePopup } from "./FileViewers/PdfFilePopup";
import { RemoteFileBrowserField } from "./RemoteFileBrowser/RemoteFileBrowserField";
import { IRemoteStorageService, IRemoteStorageServiceType } from "./Services/IRemoteStorageService";

export class FormUploadField extends FormField<FormUploadModel> {
  
  public readonly type: string = "FormUploadField";
  private readonly api: IRestClient;
  private readonly storageService: IRemoteStorageService;
  public readonly remoteFileBrowser: RemoteFileBrowserField;

  // Return the file Url for given file names as single file path or array of files in the same order as defined in fileNames
  /**
   * @function onUploadValueExtractor a callback that is invoked after upload to process the complex response.
   * @param fileNames list of file names that are uploaded
   * @param res json response from upload
   * @returns {string} return value used for file upload component.
   */
  public onUploadValueExtractor = (fileNames:string[], res:any)=>{
    return this.model.uploadResultPath?get(res, this.model.uploadResultPath):res
  }

  constructor(owner: IFormViewModel<FormModel>) {
    super(owner);
    this.api = this.Owner.container.build<IRestClient>(IRestClientType);
    this.storageService = this.Owner.container.build<IRemoteStorageService>(IRemoteStorageServiceType);
    // Create RemoteFileBrowserField with injected dependencies
    // Since it uses @IocInject, we need to pass the dependencies manually
    this.remoteFileBrowser = new RemoteFileBrowserField(this.api, this.storageService, owner);
  }
  protected createModel(): FormUploadModel {
    return new FormUploadModel();
  }

  /**
   * Initializes the upload mode based on repository configuration
   * @param repositoryId the repository ID to check configuration for
   */
  public initializeUploadMode(repositoryId: string): void {
    // Store repository ID for later use (preserve existing destinationFolderPath)
    const existingDestinationPath = this.model.destinationFolderPath;
    
    this.updateModel((m) => {
      m.repositoryId = repositoryId;
      m.isInitializing = true;
    });

    // Check if cloud upload is enabled for this repository
    this.storageService.isCloudUploadEnabled(repositoryId).subscribe({
      next: (isCloudEnabled) => {
        // Set the upload mode based on repository configuration
        this.updateModel((m) => {
          m.mode = isCloudEnabled ? UploadMode.CLOUD : UploadMode.LOCAL;
          m.isInitializing = false;
          // Preserve the destination folder path if it was already set
          if (existingDestinationPath && m.destinationFolderPath !== existingDestinationPath) {
            m.destinationFolderPath = existingDestinationPath;
          }
        });

        // If cloud upload is enabled, get the upload folder path
        if (isCloudEnabled) {
          this.storageService.getUploadsPath(repositoryId).subscribe({
            next: (uploadsPath) => {
              this.updateModel((m) => {
                m.cloudStorageConfig = {
                  uploadsPath: uploadsPath,
                  availableFiles: []
                };
              });
            },
            error: (error: any) => {
              console.error("Failed to get uploads path:", error);
              // If we can't get the uploads path, fall back to LOCAL mode
              this.updateModel((m) => {
                m.mode = UploadMode.LOCAL;
                m.isInitializing = false;
                m.error = `Cloud upload configuration error: ${error.message}`;
              });
            }
          });
        }
      },
      error: (error: any) => {
        console.error("Failed to initialize upload mode:", error);
        // Default to LOCAL mode on error
        this.updateModel((m) => {
          m.mode = UploadMode.LOCAL;
          m.isInitializing = false;
        });
      }
    });
  }

  
  async viewUploadedFile(fileName:string | undefined,index:number) : Promise<void> {
    const uploadedFile = Array.isArray(this.model.value)? this.model.value[index]:this.model.value;
    const name = uploadedFile || fileName;
    await launchDocumentViewer(this.Owner.container,name);
  }

  public onFilesChangeInternal(files: File[]) {
    this.fieldEvents.onChange({ target: this, value: [files] });
    if (this.onFilesChange) {
      this.onFilesChange(files);
    }
  }

  public onFilesChange?: (files: File[]) => void;
  
  public setValue(value: any): void {
    
    if(!(this.model.files?.length>0)){
      this.model.files = [{
        name: `${value}`.split(/(\\|\/)/g).pop()
    }];
    this.model.status = UploadStatus.SUCCESS;

    super.setValue(value);
    }
                
  }
  
  reset(e: any) {
    e.stopPropagation();
    this.updateModel((m) => {
      m.status = UploadStatus.PENDING;
      m.value = undefined;
      m.files = [];
    });
  }

  async handleFileSelect(files: File[]) {
    if (this.model.mode === UploadMode.CLOUD) {
      console.debug("Cloud mode file select - use openCloudFileBrowser instead");
      return;
    }
    this.uploadFiles(files);
  }

  /**
   * Opens the cloud file browser dialog for file selection
   */
  async openCloudFileBrowser(): Promise<void> {
    // Initialize the browser with required parameters
    // Force single-select for remote file browser
    this.remoteFileBrowser.openBrowser(
      this.model.repositoryId,
      false, // Always use single-select for remote file browser
      this.model.acceptAllFileTypes ? undefined : this.model.fileTypes.join(',')
    );

    // Open the dialog using dialog service
    const dialogService = this.Owner.container.build<IDialogServiceType>(CoreTypes.IDialogService);
    const result = await dialogService.ShowDialog(this.remoteFileBrowser, {});
    
    console.log('[FormUploadField] Dialog closed with result:', result);
    
    // If user confirmed selection, process the selected files
    if (result) {
      // Get the selected files before they are cleared
      const selectedFiles = this.remoteFileBrowser.getAndClearSelectedFiles();
      console.log('[FormUploadField] Got selected files:', selectedFiles);
      
      if (selectedFiles.length > 0) {
        console.log('[FormUploadField] Calling selectCloudFiles with:', selectedFiles);
        this.selectCloudFiles(selectedFiles);
      } else {
        console.log('[FormUploadField] No files selected');
      }
    } else {
      console.log('[FormUploadField] User cancelled selection');
      // Clear the selection if cancelled
      this.remoteFileBrowser.closeBrowser();
    }
  }

  /**
   * Handles selection of cloud files from the browser dialog
   * @param filePaths array of selected cloud file paths
   */
  selectCloudFiles(filePaths: string[]): void {
    console.log('[selectCloudFiles] Called with filePaths:', filePaths);
    console.log('[selectCloudFiles] Current model state:', {
      repositoryId: this.model.repositoryId,
      destinationFolderPath: this.model.destinationFolderPath,
      cloudStorageConfig: this.model.cloudStorageConfig,
      uploadsPath: this.model.cloudStorageConfig?.uploadsPath
    });
    
    // Upload cloud files to the system
    if (this.model.repositoryId && filePaths.length > 0) {
      console.log('[selectCloudFiles] Repository ID and filePaths check passed');
      this.updateModel((m) => {
        m.status = UploadStatus.UPLOADING;
      });
      
      // CRITICAL: No fallbacks allowed for folder paths
      if (!this.model.destinationFolderPath) {
        const error = "Destination folder path is not set. Cannot proceed with upload.";
        console.error('[selectCloudFiles] ERROR:', error);
        this.updateModel((m) => {
          m.status = UploadStatus.ERROR;
          m.error = error;
        });
        return;
      }
      
      const destinationFolder = this.model.destinationFolderPath;
      const sourceFolder = this.model.cloudStorageConfig?.uploadsPath;
      console.log('[selectCloudFiles] Folders - destination:', destinationFolder, 'source:', sourceFolder);
      
      // Verify source folder is also set
      if (!sourceFolder) {
        const error = "Source folder path is not configured. Cannot proceed with upload.";
        console.error('[selectCloudFiles] ERROR:', error);
        this.updateModel((m) => {
          m.status = UploadStatus.ERROR;
          m.error = error;
        });
        return;
      }
      
      // Use the cloud upload API with the DESTINATION folder
      console.log('[selectCloudFiles] Calling uploadRemoteFiles with:', {
        repositoryId: this.model.repositoryId,
        destinationFolder: destinationFolder,
        flowType: "FLOW_EXTRACTION_TAGGING",
        filePaths: filePaths
      });
      
      this.storageService.uploadRemoteFiles(
        this.model.repositoryId,
        destinationFolder,  // Must be the destination folder (e.g., "Contracts")
        "FLOW_EXTRACTION_TAGGING",
        filePaths
      ).subscribe({
        next: (result) => {
          // Extract the actual batch ID from the server response
          let batchId: string | undefined;
          
          // The response structure is: { value: [{ value: { batchId: "actual-id" } }] }
          if (result && result.value && Array.isArray(result.value) && result.value.length > 0) {
            const firstItem = result.value[0];
            if (firstItem && firstItem.value && firstItem.value.batchId) {
              batchId = firstItem.value.batchId;
            }
          }
          
          // If we couldn't extract a batch ID, log the structure for debugging
          if (!batchId) {
            console.error("Could not extract batch ID from server response. Response structure:", JSON.stringify(result, null, 2));
          }
          
          this.updateModel((m) => {
            m.selectedCloudFiles = [...filePaths];
            m.status = UploadStatus.SUCCESS;
            m.value = result; // Use the actual API response which contains batch ID
            m.files = filePaths.map(path => ({ name: path.split('/').pop() || path }));
            m.error = ""; // Clear any previous errors
          });
          
          this.onCloudFilesChangeInternal(filePaths);
        },
        error: (error: any) => {
          console.error("Failed to upload cloud files", error);
          this.updateModel((m) => {
            m.status = UploadStatus.ERROR;
            m.error = error.message || `Failed to upload cloud files: ${error}`;
          });
        }
      });
    }
  }

  public onCloudFilesChangeInternal(filePaths: string[]) {
    this.fieldEvents.onChange({ target: this, value: [filePaths] });
    if (this.onCloudFilesChange) {
      this.onCloudFilesChange(filePaths);
    }
  }

  public onCloudFilesChange?: (filePaths: string[]) => void;

  postFiles(data: FormData): Observable<any> {
    return this.api.post<any, any>(this.model.uploadUrl, data, ApiResponseType.Json, (r) => {
      const header = r.headers as any;
      const modified = { AuthToken: header.AuthToken };
      return { ...r, headers: modified, body: data };
    });
  }

  uploadFiles(files: File[]): void {
    console.debug("uploadFiles", files);
    this.onFilesChangeInternal(files);
    const invalidFile = files.find((file) => !this.model.fileTypes.includes(file.type));
    if (!this.model.acceptAllFileTypes && invalidFile) {
      console.debug("invalidFile", invalidFile);
      this.updateModel((x) => {
        x.customValidation = ValidationHelper.setValidation(`File type "${invalidFile.type}" not allowed`, ValidationType.Error);
        x.valid = false;
        x.error = x.customValidation;
        x.status = UploadStatus.ERROR;
      });
      return;
    }

    const formData = new FormData();
    const fileNames:string[] = [];
    files.forEach((file) => {
      formData.append("file", file);
      fileNames.push(file.name);
    });
    this.updateModel((m) => {
      m.status = UploadStatus.UPLOADING;
      m.files = files;
      m.validationMessage = null;
      m.valid = true;
    });
    console.debug("POSTING", formData);
    this.postFiles(formData).subscribe({
      next: (res) => {
        console.log("res", res);
        this.updateModel((m) => {
          m.status = UploadStatus.SUCCESS;
          m.value = this.onUploadValueExtractor(fileNames,res);
        });
      },
      error: (e) => {
        console.error(e);
        this.updateModel((m) => {
          m.files = [];
          m.status = UploadStatus.ERROR;
          m.error = e.message;
        });
      },
    });
  }

  async handleDrop(e: any) {
    console.debug("handleDrop", e);
    e.preventDefault();

    let files: File[] = [];
    if (e.dataTransfer.items[0]) {
      const fileEntries = [...e.dataTransfer.items];

      // Use DataTransferItemList interface to access the file(s)
      for (const fileEntry of fileEntries) {
        if (fileEntry.kind === "file") {
          const file = fileEntry.getAsFile();
          files.push(file);
        }
      }
    } else {
      // Use DataTransfer interface to access the file(s)
      files = [...e.dataTransfer.files];
      // Use DataTransferItemList interface to access the file(s)
    }

    this.uploadFiles(files);
  }

  dragOverHandler(ev: any) {
    console.debug("File(s) in drop zone");
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
  }
}
