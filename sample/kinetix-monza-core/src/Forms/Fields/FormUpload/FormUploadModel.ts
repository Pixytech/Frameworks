import { FieldModelBase } from "../FieldModelBase";

export enum UploadStatus {
  PENDING = "PENDING",
  UPLOADING = "UPLOADING",
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
}

export enum UploadMode {
  LOCAL = "LOCAL", // Default
  CLOUD = "CLOUD",
}

export class FormUploadModel extends FieldModelBase {
  status: UploadStatus = UploadStatus.PENDING;
  mode: UploadMode = UploadMode.LOCAL;
  isInitializing: boolean = false;
  multiple?: boolean = false;
  accept?: string;
  title?: string;
  uploadUrl: string = "/api/file_services/upload";
  uploadResultPath?: string = "value";
  acceptAllFileTypes?: boolean = false;
  fileTypes: string[] = [];
  error: string;
  files: Partial<File>[] = [];
  repositoryId?: string;
  selectedCloudFiles: string[] = [];
  cloudStorageConfig?: {
    uploadsPath?: string;  // Source folder where files are read FROM
    availableFiles?: string[];
  };
  destinationFolderPath?: string;  // Destination folder where files are uploaded TO
  

  constructor(initialValue?: any) {
    super();
    this.value = initialValue;
  }
}
