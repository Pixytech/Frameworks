import { Button, ButtonProps } from "@progress/kendo-react-buttons";
import { Popover } from "@progress/kendo-react-tooltip";
import React, { FC, useEffect } from "react";
import { AutomationHelper } from "@kinetix/core";
import { ValidationHelper } from "./Fields";
import { FormModel } from "./FormModel";
import { IFormViewModel } from "./IFormViewModel";
import "./TicketSubmitButton.scss";
import { debounce } from "lodash";

interface ITicketSubmitButtonProps extends ButtonProps {
  viewModel: IFormViewModel<FormModel>;
}

export const TicketSubmitButton: FC<ITicketSubmitButtonProps> = (props: ITicketSubmitButtonProps) => {
  const { viewModel, ...others } = props;
  const dataContext = viewModel;
  const anchor = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLDivElement>(null);
  const [overButton, setOverButton] = React.useState(false);
  const [overPopup, setoverPopup] = React.useState(false);
  const [showPopup, setshowPopup] = React.useState(false);

  const submitDisabled = !dataContext.model.valid || dataContext.model.readonly || dataContext.model.disabled || !dataContext.model.allowSubmit;

  const showErrorTip = !dataContext.model.valid || !(dataContext.model.customValidation === undefined || dataContext.model.customValidation == null);
  const ticketValidation = ValidationHelper.getValidation(dataContext.model.customValidation);
  const ticketValidationClass = ValidationHelper.getValidationClass(ticketValidation.type);
  const updatePopupState = debounce(() => {
    setshowPopup((overPopup || overButton) && showErrorTip);
  }, 400);
  useEffect(() => {
    setTimeout(() => {
      updatePopupState();
    }, 200);
  }, [overPopup, overButton, dataContext.model]);
  //console.debug(`showErrorTip:${showErrorTip} showPopup:${showPopup} overPopup:${overPopup} overButton:${overButton} submitDisabled:${submitDisabled}`);
  return (
    <>
      {dataContext.showSubmit && (
        <div
          data-automationid={AutomationHelper.GetId("submitButton-host")}
          className="ticket-submit-button "
          onMouseOver={() => {
            setOverButton(true);
            setshowPopup((overPopup || overButton) && showErrorTip);
          }}
          onMouseOut={(e) => {
            setOverButton(false);
          }}
          onFocus={() => {
            setOverButton(true);
          }}
          onBlur={(e) => {
            setOverButton(false);
          }}
        >
          <Button
            onClick={(e) => {
              setshowPopup(false);
            }}
            type={"submit"}
            {...others}
            disabled={submitDisabled ? true : undefined}
            data-automationid={AutomationHelper.GetId("submitButton")}
            className="submit-button"
            themeColor="primary"
          />
          <div
            className="placeholder"
            data-automationid={AutomationHelper.GetId("submitButton-wrapper")}
            ref={buttonRef}
            tabIndex={submitDisabled ? 0 : -1}
            style={{
              pointerEvents: showErrorTip && submitDisabled ? "visiblePainted" : "none",
            }}
          />
          <div
            data-automationid={AutomationHelper.GetId("submitButton-error-icon")}
            className={`submit-status k-icon k-font-icon k-i-error validation-error`}
            ref={anchor}
            onClick={(e) => {
              setOverButton(true);
              setshowPopup((overPopup || overButton) && showErrorTip);
            }}
            style={{
              visibility: showErrorTip ? "visible" : "collapse",
            }}
          />

          <Popover show={showPopup} anchor={anchor.current} animate={{ closeDuration: 0, openDuration: 1 }} callout={true} className="popover-outline" position="top">
            <div
              className="popover-outline-content"
              style={{ visibility: showErrorTip ? "visible" : "collapse" }}
              data-automationid={AutomationHelper.GetId("submit-popup")}
              onMouseOver={() => {
                setoverPopup(true);
              }}
              onMouseOut={(e) => {
                setoverPopup(false);
              }}
            >
              <div className="submit-validation-contents">
                {Object.keys(dataContext.model.errors)
                  .map((key) => {
                    return { name: key, value: dataContext.model.errors[key] };
                  })
                  .filter((e) => {
                    return e.value;
                  })
                  .map((e, index) => {
                    const message = e.value;
                    const field = dataContext.getFieldByName(e.name);
                    const validation = ValidationHelper.getValidation(message);
                    const validationClass = ValidationHelper.getValidationClass(validation.type);
                    return field ? (
                      <div
                        key={"validation.message"}
                        className="validation-row"
                        onClick={(e) => {
                          setoverPopup(false);
                          setOverButton(false);
                          setshowPopup(false);
                          field.focus();
                        }}
                      >
                        <span className={`k-icon k-font-icon ${validationClass}`} />
                        <div className="validation-text">{validation.message}</div>
                      </div>
                    ) : (
                      <></>
                    );
                  })}
                {dataContext.model.customValidation ? (
                  <div
                    className="validation-row"
                    onClick={(e) => {
                      setoverPopup(false);
                      setOverButton(false);
                      setshowPopup(false);
                      dataContext.moveToNextField(0);
                    }}
                  >
                    <span className={`k-icon k-font-icon ${ticketValidationClass}`} />
                    <div className="validation-text-custom">{ticketValidation.message}</div>
                  </div>
                ) : (
                  <></>
                )}
              </div>
            </div>
          </Popover>
        </div>
      )}
    </>
  );
};
