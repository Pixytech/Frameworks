import * as React from "react";
import { Popup } from "@progress/kendo-react-popup";
import { BlotterData, ITicketToolBarItem, TicketData } from "../..";
import { AutomationHelper, groupByItetrable } from "@kinetix/core";
import { Button } from "@progress/kendo-react-buttons";
import { Icon } from "@kinetix/core";
import "./TradeProductMenuStyles.scss";

export interface ITradeProductMenuProps {
  text: string;
  menuItems: ITicketToolBarItem[];
  onNewTradeClick: (data: TicketData) => void;
  onNewBlotterClick: (data: BlotterData) => void;
}

export interface ITradeProductMenuState {
  show: boolean;
}

export class TradeProductMenu extends React.Component<ITradeProductMenuProps, ITradeProductMenuState> {
  anchor: React.RefObject<Button> = React.createRef();
  contentRef: any = React.createRef();
  blurTimeoutRef: any = React.createRef();

  state = { show: false };

  handleNewTradeClick = (ticketData: TicketData) => {
    console.debug("On Trade Click in Popup", ticketData);
    this.props.onNewTradeClick({ ...ticketData });
  };

  handleNewBlotterClick = (ticketData: BlotterData) => {
    console.debug("On Blotter Click in Popup", ticketData);
    this.props.onNewBlotterClick({ ...ticketData });
  };

  onOpen = (e: any) => {
    this.contentRef.current.focus();
  };

  onFocus = () => {
    // the user is still inside the content
    clearTimeout(this.blurTimeoutRef.current);
  };

  onBlurTimeout = () => {
    // the user is now outside the popup
    this.setState({ show: false });
  };

  onBlur = () => {
    clearTimeout(this.blurTimeoutRef.current);

    this.blurTimeoutRef.current = setTimeout(this.onBlurTimeout, 200);
  };

  onClick = (e: any) => {
    this.setState({ show: !this.state.show });
  };

  render() {
    return (
      <>
        <div className="trade-menu">
          <Button ref={this.anchor} data-automationid={AutomationHelper.GetId(this.props.text)} onClick={this.onClick}>
            <div className="title">
              <Icon icon="toolbar.newTrade" />
              <div className="text">{this.props.text}</div>
            </div>
            <div className="divider"></div>
            <div className="arrow">
              <span className="k-button-icon k-icon k-font-icon k-i-arrow-s"></span>
            </div>
          </Button>
          <Popup anchor={this.anchor.current?.element} show={this.state.show} onOpen={this.onOpen} popupAlign={{ horizontal: "left", vertical: "top" }} anchorAlign={{ horizontal: "left", vertical: "bottom" }} popupClass="trade-menu-popup">
            <div ref={this.contentRef} tabIndex={0} onFocus={this.onFocus} onBlur={this.onBlur}>
              {groupByItetrable(this.props.menuItems, (i) => i.Type).map((item) => {
                return (
                  <>
                    <div className="group-header">
                      <strong>{item.key == "Blotter" ? "Blotters" : "Trades"}</strong>
                    </div>
                    <div className="items">
                      {item.data.map((item, i) => (
                        <Button key={i} onClick={() => (item.Type == "Blotter" ? this.handleNewBlotterClick(item.Data as BlotterData) : this.handleNewTradeClick(item.Data as TicketData))} disabled={!item.Enabled}>
                          <div className="item" title={`${item.Name}${item.Title ? ` - ${item.Title}` : ""}`} data-automationid={AutomationHelper.GetId(item.Name)}>
                            <div className="icon-wrapper">
                              <Icon className="icon" icon={`${item.Type == "Blotter" ? "toolbar.new-blotter" : "toolbar.newTrade"}`} />
                            </div>
                            <div className="text">{item.Name}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </>
                );
              })}
            </div>
          </Popup>
        </div>
      </>
    );
  }
}
