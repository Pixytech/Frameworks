import { Form, FormElement, FormRenderProps } from "@progress/kendo-react-form";
import { Loader } from "@progress/kendo-react-indicators";
import { FC } from "react";
import { IFormViewModel } from "./IFormViewModel";
import "./TicketLayout.scss";
import "./TicketWindow.scss";
import { TicketSubmitButton } from "./TicketSubmitButton";
import Hotkeys from "react-hot-keys";
import { FormModel } from "..";
import { StackLayout } from "@progress/kendo-react-layout";
import { Frame } from "@kinetix/core";

interface ITicketLayoutProps {
  viewModel: IFormViewModel<FormModel>;
  children?: any;
  className?: string;
  submitButtonTitle?: string;
  header?: () => any;
  footer?: () => any;
}

export const TicketLayout: FC<ITicketLayoutProps> = (props: ITicketLayoutProps) => {
  const dataContext = props.viewModel;
  const loadingPanel = (
    <div className="loading-panel">
      <Loader type="infinite-spinner" />
      <span className="busy-text">{dataContext.model.busyText}</span>
    </div>
  );
  const handleSubmit = async (e: any, formRenderProps: FormRenderProps) => {
    if (formRenderProps.valid) await dataContext.submit(e);
  };

  const header = () => {
    if (props.header) {
      return <div className="row-header row">{props.header()}</div>;
    }
    return <></>;
  };
  const footer = () => {
    if (props.footer) {
      return <div className="row row-footer">{props.footer()}</div>;
    } else if (dataContext.showSubmit) {
      return (
        <div className="row row-submit">
          <StackLayout orientation="horizontal" align={{ horizontal: "end" }}>
            <TicketSubmitButton viewModel={dataContext}>{props.submitButtonTitle || "Submit"} </TicketSubmitButton>
          </StackLayout>
        </div>
      );
    }
    return <></>;
  };
  return (
    <Frame className={"ticket-wrapper" + (props.className ? " " + props.className : "")}>
      {(dataContext.model.submitting || dataContext.model.reloading || dataContext.model.busyText) && loadingPanel}
      {!dataContext.model.reloading && (
        <Form
          onSubmit={(e) => dataContext.submit(e)}
          initialValues={dataContext.getInitialData()}
          key={dataContext.model.formKey}
          render={(formRenderProps: FormRenderProps) => {
            if (dataContext.model) {
              dataContext.onFormRender(formRenderProps);
            }
            return (
              <Hotkeys
                keyName="ctrl+enter,enter"
                onKeyUp={async (shortcut: string, e: any) => {
                  if (e.ctrlKey) {
                    await handleSubmit(e, formRenderProps);
                  } else {
                    const target = e.target;
                    if (target.tagName !== "TEXTAREA" && target.blur && !target.classList.contains("ProseMirror")) {
                      target.blur();
                    }
                  }
                }}
                filter={(e: any) => {
                  if (e.key === "Enter" && !e.ctrlKey && e.target.tagName !== "TEXTAREA") {
                    e.preventDefault();
                  }

                  return true;
                }}
              >
                <FormElement>
                  {header()}

                  <div className="form-content row">{props.children}</div>

                  {footer()}
                </FormElement>
              </Hotkeys>
            );
          }}
        />
      )}
    </Frame>
  );
};
