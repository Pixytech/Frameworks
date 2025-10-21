import { useViewModelInstance } from "@kinetix/core";
import { FC } from "react";
import { IMainToolbar } from "./IMainToolbar";
import "./MainToolbar.scss";
import { TradeProductMenu } from "./ToolbarMenuItems/TradeProductMenu";

interface MainToolbarViewProps {
  dataContext: IMainToolbar;
}

export const MainToolbarView: FC<MainToolbarViewProps> = (props) => {
  const vm = useViewModelInstance(props.dataContext);

  return (
    <div className="main-toolbar">
      <div className="toolbar-container">
        {vm.model.MenuItems &&
          Object.keys(vm.model.MenuItems).map((item, i) => {
            return (
              <div key={i}>
                {vm.model.MenuItems[item].some((x) => x.Visible) ? (
                  <div className="toolbar-item">
                    <TradeProductMenu text={item} menuItems={vm.model.MenuItems[item].filter((x) => x.Visible)} onNewTradeClick={vm.launchTicket} onNewBlotterClick={vm.launchBlotter} />
                  </div>
                ) : (
                  <></>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};
