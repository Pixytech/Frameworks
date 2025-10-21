import { FieldModelBase } from "../../FieldModelBase";
import { IRemoteFile } from "../Services/IRemoteStorageService";

export class RemoteFileBrowserModel extends FieldModelBase {
  isOpen: boolean = false;
  loading: boolean = false;
  files: IRemoteFile[] = [];
  selectedFiles: string[] = [];
  allowMultiple: boolean = false;
  fileFilter?: string;
  error?: string;
  repositoryId?: string;
  uploadsPath?: string;

  constructor(initialValue?: any) {
    super();
    this.value = initialValue;
  }
}