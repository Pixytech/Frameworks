import { Field } from "@progress/kendo-react-form";
import React, { useEffect, FC, useState } from "react";
import { Subscription } from "rxjs";
import { FormFieldLayout, IFieldTemplateContext, IFormFieldTemplate } from "../FormFieldLayout";
import { IFormFieldComponentProps, useCommonProperties } from "../IFormField";
import { FormUploadField } from "./FormUploadField";
import { AutomationHelper, Icon } from "@kinetix/core";
import { UploadStatus, UploadMode } from "./FormUploadModel";
import { Loader } from "@progress/kendo-react-indicators";
import "./FormUpload.scss";
import { Button } from "@progress/kendo-react-buttons";
export interface IFormUploadProps extends IFormFieldComponentProps {
  dataContext: FormUploadField;
  multiple?: boolean;
  accept?: string;
  title?: string;
  uploadUrl?: string;
  uploadResultPath?: string;
  acceptAllFileTypes?: boolean;
}

export interface IFormUploadChildProps {
  field: FormUploadField;
  context: IFieldTemplateContext;
}

export const FormUploadFieldTemplate: IFormFieldTemplate<FormUploadField> = (field: FormUploadField, context: IFieldTemplateContext) => {
  const fieldRef = React.useRef(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    let subscription: Subscription | undefined;
    if (fieldRef?.current) {
      subscription = context.onInit(fieldRef);
    }
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [context]);

  const handleClick = () => {
    if (field.model.mode === UploadMode.LOCAL) {
      fileInputRef.current?.click();
    } else {
      field.openCloudFileBrowser();
    }
  };

  return (
    <div className="form-upload-field" style={context.others.style}>
      <div className="form-upload-field-drop-area" onDrop={(e) => (field.model.mode === UploadMode.LOCAL ? field.handleDrop(e) : undefined)} onDragOver={(e) => (field.model.mode === UploadMode.LOCAL ? field.dragOverHandler(e) : undefined)} onClick={field.model.isInitializing ? undefined : handleClick}>
        <div className="form-upload-field-drop-area-content">
          <input
            className="form-upload-field-drop-area-content-input"
            ref={fileInputRef}
            accept={field.model.accept ? field.model.accept : ".pdf"}
            data-automationid={AutomationHelper.GetId("uploadFileInput")}
            type="file"
            title={field.model.title ? field.model.title : "Select a document to upload"}
            multiple={field.model.multiple}
            onChange={async (e) => {
              const files = e.target.files;
              if (files) {
                await field.handleFileSelect([...files]);
              }
            }}
          />
          <div className="form-upload-field-visual-container">
            {field.model.isInitializing && (
              <>
                <Loader className="status-icon loader" type="infinite-spinner" />
                <div className="files">
                  <Button fillMode="flat" type="button" className="file-title message" themeColor="primary">
                    Initializing upload mode...
                  </Button>
                </div>
              </>
            )}
            {!field.model.isInitializing && field.model.status === UploadStatus.PENDING && (
              <>
                <Icon className="status-icon" icon="uploadField.upload" />
                <div className="files">
                  <Button fillMode="flat" type="button" className="file-title message" themeColor="primary">
                    {field.model.title ? field.model.title : field.model.mode === UploadMode.LOCAL ? "Upload new document" : "Browse Storage Files"}
                  </Button>
                  <Button fillMode="flat" type="button" className="file-title message extension" themeColor="secondary">
                    {(field.model.accept ? `${field.model.accept}` : ".pdf").replaceAll(".", " ")}
                  </Button>
                </div>
              </>
            )}
            {!field.model.isInitializing && field.model.status === UploadStatus.UPLOADING && (
              <>
                <Loader className="status-icon loader" type="infinite-spinner" />
                <div className="files">
                  <Button fillMode="flat" type="button" className="file-title  message" themeColor="primary">
                    Uploading document...
                  </Button>
                </div>
              </>
            )}
            {!field.model.isInitializing && field.model.status === UploadStatus.SUCCESS && (
              <>
                <Icon className="status-icon" icon="uploadField.file" />
                <div className="files">
                  {field.model.files.map((file, index) => (
                    <Button
                      fillMode="flat"
                      type="button"
                      className="file-title"
                      key={`key${file?.name}-${index}`}
                      onClick={async (e) => {
                        e.stopPropagation();
                        await field.viewUploadedFile(file?.name, index);
                      }}
                      themeColor="primary"
                    >{`${file?.name}`}</Button>
                  ))}
                </div>
                <Button
                  fillMode="flat"
                  type="button"
                  className="file-action"
                  onClick={(e) => {
                    if (fileInputRef.current) fileInputRef.current.value = "";
                    field.reset(e);
                  }}
                  data-automationid={AutomationHelper.GetId("reset")}
                >
                  Reset
                </Button>
              </>
            )}
            {!field.model.isInitializing && field.model.status === UploadStatus.ERROR && (
              <>
                <div className="files">
                  <Button className="file-title" type="button" themeColor="error">{`Error: ${field.model.error ?? "please try again"}`}</Button>
                </div>
                <Button
                  fillMode="flat"
                  type="button"
                  className="file-action"
                  onClick={(e) => {
                    if (fileInputRef.current) fileInputRef.current.value = "";
                    field.reset(e);
                  }}
                  data-automationid={AutomationHelper.GetId("reset")}
                >
                  Reset{" "}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const FormUpload: FC<IFormUploadProps> = (props: IFormUploadProps) => {
  useCommonProperties(props, () => {
    if (props.multiple) {
      props.dataContext.model.multiple = props.multiple;
    }

    if (props.label) {
      props.dataContext.label = props.label;
    }

    if (props.accept) {
      props.dataContext.model.accept = props.accept;
    }
    if (props.title) {
      props.dataContext.model.title = props.title;
    }
    if (props.uploadUrl) {
      props.dataContext.model.uploadUrl = props.uploadUrl;
    }
    if (props.uploadResultPath) {
      props.dataContext.model.uploadResultPath = props.uploadResultPath;
    }
    if (props.acceptAllFileTypes) {
      props.dataContext.model.acceptAllFileTypes = props.acceptAllFileTypes;
    }
  });

  return props.dataContext.model.hidden ? <></> : <Field className={props.className} col={props.col} row={props.row} colSpan={props.colSpan} rowSpan={props.rowSpan} style={props.style} labelPosition={props.labelPosition} minLabelWidth={props.minLabelWidth} maxLabelWidth={props.maxLabelWidth} component={FormFieldLayout} fieldTemplate={FormUploadFieldTemplate} dataContext={props.dataContext} name={props.dataContext.name} label={props.dataContext.label} validator={props.dataContext.getValidators()} />;
};
