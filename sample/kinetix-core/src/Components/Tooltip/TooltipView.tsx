import { FC } from "react";
import { Button } from "@progress/kendo-react-buttons";
import { Popover } from "@progress/kendo-react-tooltip";
import "./Tooltip.scss";
import { useViewModelInstance } from "../../Mvvm";
import { TooltipViewModel } from "./TooltipViewModel";
import { Icon } from "../../Theme/Icons/Icon";

interface ITooltipHeader {
  stopThisTutorial(): Promise<void>;
}

const TooltipHeader = (props: ITooltipHeader) => {
  return (
    <div className="tooltip-header-wrapper">
      <div>
        <Icon icon="lightbulb" />
        <span>Tip</span>
      </div>

      <Button themeColor={"primary"} fillMode={"flat"} className="action-buttons" onClick={async () => await props.stopThisTutorial()}>
        Skip the tips
      </Button>
    </div>
  );
};

export interface TooltipProps {
  dataContext: TooltipViewModel;
}

export const TooltipView: FC<TooltipProps> = (props: TooltipProps) => {
  const dataContext = useViewModelInstance(props.dataContext);

  const anchorSelector = dataContext.model.tutorials?.context[dataContext.model.tutorialIndex]?.anchor;
  const anchorElement = anchorSelector ? document.querySelector(anchorSelector) as HTMLElement : null;

  return (
    <>
      {dataContext.model.showTutotial && dataContext.model.tutorials && anchorElement ? (
        <div className="tooltip-container">
          <Popover appendTo={null} collision={{ vertical: "fit", horizontal: "fit" }} show={true} id="tooltip-body" anchor={anchorElement} position={`${dataContext.model.tutorials?.context[dataContext.model.tutorialIndex]?.position}`} title={<TooltipHeader stopThisTutorial={async () => await dataContext.stopTutorial()} />} onPosition={() => dataContext.handleCalloutPosition()}>
            <div className="tooltip-content-wrapper">
              <h3>{dataContext.model.tutorials?.context[dataContext.model.tutorialIndex]?.title}</h3>
              <p>{dataContext.model.tutorials?.context[dataContext.model.tutorialIndex]?.message}</p>
            </div>

            <div className="tooltip-footer-wrapper">
              <span>{`${dataContext.model.tutorialIndex + 1}/${dataContext.model.tutorials.context.length}`}</span>
              <Button themeColor={"primary"} fillMode={"flat"} className="action-buttons button-next" onClick={async () => {
                if (dataContext.model.tutorials?.context.length === dataContext.model.tutorialIndex + 1) {
                  await dataContext.stopTutorial();
                } else {
                  dataContext.updateTutorialIndex(dataContext.model.tutorialIndex + 1);
                }
              }}>
                {dataContext.model.tutorials.context.length === dataContext.model.tutorialIndex + 1 ? (
                  "Got it"
                ) : (
                  <>
                    Next <Icon icon="arrowRight" className="arrow-right-icon" />
                  </>
                )}
              </Button>
            </div>
          </Popover>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};
