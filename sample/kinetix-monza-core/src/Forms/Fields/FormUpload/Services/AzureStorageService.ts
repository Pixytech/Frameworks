import { IRestClientType, IocInject, IocInjectable, type IRestClient } from "@kinetix/core";
import { IRemoteStorageService, IRepositoryConfig, IRemoteFile } from "./IRemoteStorageService";
import { Observable } from "rxjs";
import { map, catchError, tap } from "rxjs/operators";
import { throwError } from "rxjs";

@IocInjectable()
export class AzureStorageService implements IRemoteStorageService {
  
  constructor(@IocInject(IRestClientType) private apiClient: IRestClient) {}

  /**
   * Gets repository configuration including custom tags
   * @param repositoryId the repository ID
   * @returns Observable with repository configuration
   */
  getRepositoryConfig(repositoryId: string): Observable<IRepositoryConfig> {
    const url = `/api/content_automation/repositories/${repositoryId}/tags`;
    
    return this.apiClient.get<IRepositoryConfig>(url).pipe(
      map((result) => {
        // The response is directly the IRepositoryConfig object
        return result;
      }),
      catchError((error) => {
        console.error("getRepositoryConfig error:", error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Lists available files from remote storage at the specified path
   * @param path the storage path to list files from
   * @returns Observable with array of remote files
   */
  listFiles(path: string): Observable<IRemoteFile[]> {
    const url = `/api/file_services/files?path=${encodeURIComponent(path)}`;
    
    return this.apiClient.get<string[]>(url).pipe(
      map((fileNames) => {
        // Convert file names to IRemoteFile objects
        const remoteFiles = fileNames.map((fileName: string) => ({
          name: fileName,
          path: `${path}/${fileName}`,
          extension: this.getFileExtension(fileName),
          icon: this.getFileIcon(fileName)
        }));
        
        return remoteFiles;
      }),
      catchError((error) => {
        console.error("listFiles error:", error);
        return throwError(() => error);
      })
    );
  }

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
  ): Observable<any> {
    const url = `/api/content_automation/upload_cloud?repositoryId=${repositoryId}&folderPath=${encodeURIComponent(folderPath)}&flowType=${flowType}`;
    
    // According to API docs: send list of file paths <folder>/<file_name> as jsonarray in the body
    const payload = filePaths;
    
    console.log('[AzureStorageService] Making POST request to:', url);
    console.log('[AzureStorageService] Payload:', payload);
    
    return this.apiClient.post<any, any>(url, payload).pipe(
      tap(response => {
        console.log('[AzureStorageService] Upload response:', response);
      }),
      catchError((error) => {
        console.error("[AzureStorageService] Remote file upload failed:", error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Gets the uploads folder path from repository configuration
   * @param repositoryId the repository ID
   * @returns Observable with uploads folder path
   */
  getUploadsPath(repositoryId: string): Observable<string> {
    return this.getRepositoryConfig(repositoryId).pipe(
      map((config) => {
        // Check if customTags exists and is an array
        if (!config.customTags || !Array.isArray(config.customTags)) {
          throw new Error(`Repository ${repositoryId} has no custom tags configured`);
        }
        
        // Find the upload_source_folder tag
        const uploadSourceFolderTag = config.customTags.find(tag => 
          tag.name === 'upload_source_folder' && tag.isActive
        );
        
        if (!uploadSourceFolderTag) {
          throw new Error(`Repository ${repositoryId} is missing the 'upload_source_folder' tag configuration`);
        }
        
        // Check the value field for the path
        if (!uploadSourceFolderTag.value || uploadSourceFolderTag.value.trim() === '') {
          throw new Error(`Repository ${repositoryId} has 'upload_source_folder' tag but the value is empty or missing`);
        }
        
        return uploadSourceFolderTag.value;
      }),
      catchError((error) => {
        console.error("getUploadsPath error:", error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Checks if repository is configured for cloud upload
   * @param repositoryId the repository ID
   * @returns Observable with boolean indicating if cloud upload is enabled
   */
  isCloudUploadEnabled(repositoryId: string): Observable<boolean> {
    return this.getRepositoryConfig(repositoryId).pipe(
      map((config) => {
        // Check if customTags exists and is an array
        if (!config.customTags || !Array.isArray(config.customTags)) {
          return false;
        }
        
        // Find the upload_source tag
        const uploadSourceTag = config.customTags.find(tag => 
          tag.name === 'upload_source' && tag.isActive
        );
        
        if (!uploadSourceTag || !uploadSourceTag.value) {
          return false;
        }
        
        const isCloud = uploadSourceTag.value.toUpperCase() === 'CLOUD';
        
        return isCloud;
      }),
      catchError((error) => {
        console.error("isCloudUploadEnabled error:", error);
        // Default to LOCAL mode on error
        return throwError(() => false);
      })
    );
  }

  /**
   * Gets file extension from file name
   * @param fileName the file name
   * @returns file extension
   */
  private getFileExtension(fileName: string): string {
    const lastDot = fileName.lastIndexOf('.');
    return lastDot > -1 ? fileName.substring(lastDot + 1).toLowerCase() : '';
  }

  /**
   * Gets appropriate icon for file type
   * @param fileName the file name
   * @returns icon name
   */
  private getFileIcon(fileName: string): string {
    const extension = this.getFileExtension(fileName);
    
    switch (extension) {
      case 'pdf':
        return 'file-pdf';
      case 'doc':
      case 'docx':
        return 'file-word';
      case 'xls':
      case 'xlsx':
        return 'file-excel';
      case 'ppt':
      case 'pptx':
        return 'file-powerpoint';
      case 'txt':
        return 'file-text';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'file-image';
      default:
        return 'file';
    }
  }
}