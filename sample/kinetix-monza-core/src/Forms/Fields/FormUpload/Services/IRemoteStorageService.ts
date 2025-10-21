import { Observable } from "rxjs";

export interface IRemoteFile {
  name: string;
  path: string;
  extension: string;
  icon?: string;
}

export interface IRepositoryTag {
  name: string;
  value: string;
  updated?: string;
  created?: string;
  version?: number;
  updatedBy?: string;
  isActive?: boolean;
  customTagType?: string;
  isMandatory?: boolean;
}

export interface IRepositoryConfig {
  customTags: IRepositoryTag[];
}

export interface IRemoteStorageService {
  /**
   * Gets repository configuration including custom tags
   * @param repositoryId the repository ID
   * @returns Observable with repository configuration
   */
  getRepositoryConfig(repositoryId: string): Observable<IRepositoryConfig>;

  /**
   * Lists available files from remote storage at the specified path
   * @param path the storage path to list files from
   * @returns Observable with array of remote files
   */
  listFiles(path: string): Observable<IRemoteFile[]>;

  /**
   * Uploads files to remote storage
   * @param repositoryId the repository ID
   * @param folderPath the target folder path
   * @param flowType the flow type for processing
   * @param filePaths array of remote file paths to upload
   * @returns Observable with upload result
   */
  uploadRemoteFiles(
    repositoryId: string, 
    folderPath: string, 
    flowType: string, 
    filePaths: string[]
  ): Observable<any>;

  /**
   * Gets the uploads folder path from repository configuration
   * @param repositoryId the repository ID
   * @returns Observable with uploads folder path
   */
  getUploadsPath(repositoryId: string): Observable<string>;

  /**
   * Checks if repository is configured for cloud upload
   * @param repositoryId the repository ID
   * @returns Observable with boolean indicating if cloud upload is enabled
   */
  isCloudUploadEnabled(repositoryId: string): Observable<boolean>;
}

export const IRemoteStorageServiceType = Symbol.for("IRemoteStorageService");