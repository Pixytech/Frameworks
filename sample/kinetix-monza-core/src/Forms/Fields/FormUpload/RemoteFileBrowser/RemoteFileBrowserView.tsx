import React, { useEffect, FC, useState } from "react";
import { Subscription } from "rxjs";
import { RemoteFileBrowserField } from "./RemoteFileBrowserField";
import { IRemoteFile } from "../Services/IRemoteStorageService";
import { AutomationHelper, Icon, CoreTypes, type IDialogService } from "@kinetix/core";
import { Button } from "@progress/kendo-react-buttons";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import { Loader } from "@progress/kendo-react-indicators";
import "./RemoteFileBrowserView.scss";

export interface IRemoteFileBrowserProps {
  field: RemoteFileBrowserField;
}

export const RemoteFileBrowserView: FC<IRemoteFileBrowserProps> = (props) => {
  const { field } = props;
  
  const [model, setModel] = useState(() => ({ 
    ...field.model,
    files: field.model.files ? [...field.model.files] : [],
    selectedFiles: field.model.selectedFiles ? [...field.model.selectedFiles] : []
  }));

  useEffect(() => {
    const subscription: Subscription = field.onModelChanged.subscribe(() => {
      console.log('[RemoteFileBrowserView] Model changed event received');
      console.log('[RemoteFileBrowserView] field.model.selectedFiles:', field.model.selectedFiles);
      const newModel = { 
        ...field.model,
        files: [...field.model.files],
        selectedFiles: [...field.model.selectedFiles]
      };
      console.log('[RemoteFileBrowserView] Setting new model with selectedFiles:', newModel.selectedFiles);
      setModel(newModel);
    });

    // Set initial model state
    const initialModel = { 
      ...field.model,
      files: field.model.files ? [...field.model.files] : [],
      selectedFiles: field.model.selectedFiles ? [...field.model.selectedFiles] : []
    };
    setModel(initialModel);

    return () => {
      subscription.unsubscribe();
    };
  }, [field]);

  const handleFileSelect = (dataItem: IRemoteFile, selected: boolean) => {
    console.log('[RemoteFileBrowserView] handleFileSelect called:', { dataItem, selected });
    const currentSelection = [...model.selectedFiles];
    console.log('[RemoteFileBrowserView] Current selection before:', currentSelection);
    
    if (selected) {
      if (model.allowMultiple) {
        if (!currentSelection.includes(dataItem.path)) {
          currentSelection.push(dataItem.path);
        }
      } else {
        currentSelection.splice(0, currentSelection.length, dataItem.path);
      }
    } else {
      const index = currentSelection.indexOf(dataItem.path);
      if (index > -1) {
        currentSelection.splice(index, 1);
      }
    }

    console.log('[RemoteFileBrowserView] New selection:', currentSelection);
    field.selectFiles(currentSelection);
  };

  const handleRowClick = (dataItem: IRemoteFile) => {
    const isSelected = isFileSelected(dataItem.path);
    handleFileSelect(dataItem, !isSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Select all files
      const allFilePaths = field.model.files.map(file => file.path);
      field.selectFiles(allFilePaths);
    } else {
      // Deselect all files
      field.selectFiles([]);
    }
  };

  const areAllSelected = () => {
    return field.model.files.length > 0 && 
           field.model.files.every(file => model.selectedFiles.includes(file.path));
  };

  const handleConfirm = () => {
    console.log('[RemoteFileBrowserView] handleConfirm called');
    console.log('[RemoteFileBrowserView] Current model.selectedFiles:', model.selectedFiles);
    console.log('[RemoteFileBrowserView] Current field.model.selectedFiles:', field.model.selectedFiles);
    
    // Close dialog with success result - selected files will be processed in FormUploadField
    const dialogService = field.Owner.container.build<IDialogService>(CoreTypes.IDialogService);
    dialogService.Close(field, true);
  };

  const handleCancel = () => {
    // Close dialog with cancel result
    const dialogService = field.Owner.container.build<IDialogService>(CoreTypes.IDialogService);
    dialogService.Close(field, false);
  };

  const isFileSelected = (filePath: string): boolean => {
    return model.selectedFiles.includes(filePath);
  };

  return (
    <div className="remote-file-browser-content">
        {model.loading && (
          <div className="loading-container">
            <Loader type="infinite-spinner" />
            <div className="loading-message">Loading remote files...</div>
          </div>
        )}

        {model.error && (
          <div className="error-container">
            <Icon icon="error" className="error-icon" />
            <div className="error-message">{model.error}</div>
          </div>
        )}

        {!model.loading && !model.error && (
          <div className="file-grid-container">
            <Grid
              data={field.model.files}
              style={{ height: "400px" }}
              className="remote-file-grid"
              onRowClick={(e) => {
                // Only trigger row click if the click wasn't on the checkbox itself
                const target = e.nativeEvent.target as HTMLElement;
                if (target.tagName !== 'INPUT') {
                  handleRowClick(e.dataItem);
                }
              }}
            >
              <GridColumn
                field="selected"
                title={model.allowMultiple ? "" : ""}
                headerCell={() => model.allowMultiple ? (
                  <th>
                    <input
                      type="checkbox"
                      checked={areAllSelected()}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      data-automationid={AutomationHelper.GetId("selectAllFiles")}
                    />
                  </th>
                ) : <th></th>}
                width="50px"
                cell={(props) => (
                  <td>
                    <input
                      type={model.allowMultiple ? "checkbox" : "radio"}
                      name="fileSelection"
                      checked={isFileSelected(props.dataItem.path)}
                      onChange={(e) => handleFileSelect(props.dataItem, e.target.checked)}
                      onClick={(e) => e.stopPropagation()}
                      data-automationid={AutomationHelper.GetId(`fileSelect_${props.dataItem.name}`)}
                    />
                  </td>
                )}
              />
              <GridColumn
                field="name"
                title="File Name"
                cell={(props) => (
                  <td style={{ cursor: 'pointer' }}>
                    <div className="file-name-cell">
                      <Icon icon="file" className="file-icon" />
                      <span className="file-name">{props.dataItem.name}</span>
                    </div>
                  </td>
                )}
              />
              <GridColumn
                field="extension"
                title="Type"
                width="100px"
                cell={(props) => (
                  <td style={{ cursor: 'pointer' }}>
                    {props.dataItem.extension}
                  </td>
                )}
              />
            </Grid>
          </div>
        )}

        {!model.loading && (
          <div className="dialog-actions">
            <Button
              onClick={handleCancel}
              fillMode="outline"
              data-automationid={AutomationHelper.GetId("remoteBrowserCancel")}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              themeColor="primary"
              disabled={model.selectedFiles.length === 0 || model.loading}
              data-automationid={AutomationHelper.GetId("remoteBrowserConfirm")}
            >
              Select {model.selectedFiles.length > 0 ? `(${model.selectedFiles.length})` : ''}
            </Button>
          </div>
        )}
      </div>
  );
};