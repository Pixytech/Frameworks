import { FC } from "react";
import { Drawer, DrawerContent, DrawerItem, DrawerItemProps } from "@progress/kendo-react-layout";

import { Icon, isRouteActive,useViewModelInstance, AutomationHelper } from "@kinetix/core";
import { IWorkspace } from "./IWorkspace";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import "./Workspace.scss";
import HeaderView from "../WorkspaceHeader/HeaderView";

//const items = [{ text: "Apps", icon: "drawer.apps", route: "apps" }];

interface IWorkspaceProps {
  dataContext: IWorkspace;
}

const WorkspaceView: FC<IWorkspaceProps> = (props: IWorkspaceProps) => {
  const dataContext = useViewModelInstance(props.dataContext);

  const ItemTemplate = (props: DrawerItemProps) => {
    return (
      <>
        {props.index === 0 && (
          <>
            <li className="k-drawer-item drawer-item" style={{ marginTop: 0, marginBottom: 0 }}>
              
            </li>
            <li
              className="k-drawer-item drawer-item"
              style={{
                pointerEvents: "none",
              }}
            >
              <span className="drawer-item-span" style={{ height: "min-content" }}>
                <div
                  className="kx-icon kx-icon-svg"
                  style={{
                    height: "2px",
                    backgroundColor: "rgba(255,255,255,0.09)",
                    margin: "1.5px 0",
                  }}
                ></div>
              </span>
            </li>
          </>
        )}
        <DrawerItem {...props} className={"drawer-item"} data-automationid={AutomationHelper.GetId(`drawer-${props.text}`)} title={props.text}>
          <span className="drawer-item-span">
            <Icon className="kx-icon kx-icon-svg" icon={`${props.icon}`} />
          </span>
          <div
            className="item-desc"
            style={{
              marginLeft: "0.687rem",
              lineHeight: "1.125rem",
              fontSize: "0.875rem",
            }}
          >
            <div>{props.text}</div>
          </div>
        </DrawerItem>
      </>
    );
  };

  const location = useLocation();
  const navigator = useNavigate();
  // TODO: the drawer test below wont refresh if we use no update versions of navigation and location
  // with mvvm it should be event driven or use the normal location and navigation hooks.

  return (
    <div className="kx-default-shell workspace" data-automationid={AutomationHelper.GetId("workspaceContent")}>
      <HeaderView dataContext={dataContext.getHeaderViewModel()} title={dataContext.getCurrentDrawerText(location)} />
      <Drawer
        className="drawer"
        expanded={dataContext.model.expanded}
        position={"start"}
        mode={"push"}
        mini={true}
        items={dataContext.model.drawerItems.map((item) => {
          return { ...item, selected: isRouteActive(location, item.link) };
        })}
        onSelect={(e) => {
          navigator(e.itemTarget.props.link);
        }}
        item={ItemTemplate}
      >
        <DrawerContent style={{ width: "calc(100% - 15rem)" }} className="container">
          
          <div className="content-region" style={{ padding: "5px" }}>
            <Outlet context={dataContext} />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default WorkspaceView;
