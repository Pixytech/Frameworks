import { Window } from "@progress/kendo-react-dialogs";
import React, { useCallback, useEffect, FC, ReactNode } from "react";
import { IViewModel, useViewModelInstance } from "../../Mvvm";
import { RegionView } from "../RegionView";
import { IDialogComponent } from "./IDialogComponent";
import { IHeaderTemplateProps } from "./IDialogContext";
import { Button } from "@progress/kendo-react-buttons";
import { WindowStage } from "./DialogContext";

interface IDialogComponentViewProps {
  dataContext: IDialogComponent;
}

export const DialogComponentView: FC<IDialogComponentViewProps> = (props: IDialogComponentViewProps) => {
  const dataContext = useViewModelInstance(props.dataContext);

  const dialogRef = React.useRef<HTMLDivElement>(null);
  const loaded = React.useRef<boolean>(true);

  const title = dataContext.model.headerTemplate && dataContext.model.content ? getHeaderComponent(dataContext, dataContext.model.headerTemplate, dataContext.model.content) : dataContext.model.title;
  const handleCyclicTabEvent = useCallback((event: any) => {
    /*  @ts-ignore: */
    var ContentWrapper = dialogRef.current.element; //.querySelector('.k-window');
    if (ContentWrapper && event.keyCode === 9) {
      const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
      var focusableContent = ContentWrapper.querySelectorAll(focusableElements);
      var firstFocusableElement = focusableContent[0];
      var lastFocusableElement = focusableContent[focusableContent.length - 1];
      var currentDocument = document;
      if (event.shiftKey) {
        if ((currentDocument && currentDocument.activeElement === firstFocusableElement) || (currentDocument && currentDocument.activeElement === event.element)) {
          lastFocusableElement.focus();
          event.preventDefault();
        }
      } else {
        if (currentDocument && (currentDocument.activeElement === lastFocusableElement || currentDocument.activeElement === lastFocusableElement.closest("div"))) {
          firstFocusableElement.focus();
          event.preventDefault();
        }
      }
    }
  }, []);

  useEffect(() => {
    /*  @ts-ignore: */
    const ContentWrapper = dialogRef.current?.element;

    if (ContentWrapper) {
      ContentWrapper.dataset.automationid = "dialog";
      ContentWrapper.focus();
      if (dataContext.model.cyclicTab && loaded.current) {
        loaded.current = false;
        ContentWrapper.addEventListener("keydown", handleCyclicTabEvent);
      }
    }
  }, []);

  const removeEventHandler = () =>
    /*  @ts-ignore: */
    dialogRef.current?.element.removeEventListener("keydown", handleCyclicTabEvent);
  return (
    <Window
      ref={dialogRef}
      title={title}
      style={dataContext.model.style}
      className={dataContext.model.className}
      modal={dataContext.model.isModel}
      resizable={dataContext.model.resizable}
      draggable={dataContext.model.draggable}
      stage={dataContext.model.stage ? dataContext.model.stage : WindowStage.DEFAULT}
      minimizeButton={dataContext.model.canMinimize ? undefined : () => null}
      maximizeButton={dataContext.model.canMaximize ? undefined : () => null}
      restoreButton={dataContext.model.canMinimize || dataContext.model.canMaximize ? undefined : () => null}
      closeButton={
        dataContext.model.canClose
          ? () => (
              <Button
                onClick={() => {
                  removeEventHandler();
                  dataContext.Close(false);
                }}
                data-automationid="cancelButton"
                fillMode="flat"
                icon="close"
              ></Button>
            )
          : () => null
      }
      onStageChange={(e) => {
        dataContext.updateModel((m) => {
          m.stage = e.state as WindowStage;
        });
      }}
      onResize={(e) => {
        dataContext.updateModel((m) => {
          m.width = e.width;
          m.height = e.height;
        });
      }}
      initialWidth={dataContext.model.initialWidth}
      initialHeight={dataContext.model.initialHeight}
      width={dataContext.model.width}
      height={dataContext.model.height}
      onClose={() => {
        removeEventHandler();
        dataContext.Close(false);
      }}
    >
      {dataContext.model.content ? <RegionView viewModel={dataContext.model.content} /> : <div></div>}
    </Window>
  );
};

function getHeaderComponent(dialogComponent: IDialogComponent, headerTemplate: React.FC<IHeaderTemplateProps>, headerContext: IViewModel): ReactNode {
  const Component = headerTemplate;
  return <Component dataContext={headerContext} dialogComponent={dialogComponent} />;
}
