import { Switch } from "@progress/kendo-react-inputs";
import { useRef } from "react";
import BoldIcon from "../../../../../resources/images/Bold.svg";
import ItalicIcon from "../../../../../resources/images/Italic.svg";
import UnderlineIcon from "../../../../../resources/images/Underline.svg";

import StrikethroughIcon from "../../../../../resources/images/Strikethrough.svg";
import EditIcon from "../../../../../resources/images/Edit.svg";
import NoneIcon from "../../../../..//resources/images/None.svg";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import { useViewModelInstance, AutomationHelper } from "@kinetix/core";

import { Popup } from "@progress/kendo-react-popup";
import { Button } from "@progress/kendo-react-buttons";
import "./FormatOptionsPopupViewStyles.scss";
import { IBlotterCellFormatOptionsPopup } from ".";
import { useOutsideBoundsClick } from "../../../../../Utils/useOutsideBoundsClick";

export interface IBlotterCellFormatOptionsPopupProps {
  dataContext: IBlotterCellFormatOptionsPopup;
}

export const BlotterFormatOptionsPopupView = (props: IBlotterCellFormatOptionsPopupProps) => {
  const vm = useViewModelInstance(props.dataContext);

  const formatOptionsPopupAnchor = useRef<HTMLDivElement | null>(null);

  const popupBoundsRef = useOutsideBoundsClick(() => vm.closePopup());

  const defaultColors: string[] = [
    "#F0F0F0", //content-200
    "#00CF85", //correct-400
    "#EB173E", //Error-400
    "#21C1F3", //Series E-400
    "#FFD166", //Series C-400
    "#EF476F", //Series B-400
  ];

  const getPreviewStyles = (): any => {
    let styles = {};
    if (vm.model.formats?.textStyles?.bold) {
      styles = { ...styles, fontWeight: "bold" };
    }
    if (vm.model.formats?.textStyles?.italic) {
      styles = { ...styles, fontStyle: "italic" };
    }
    if (vm.model.formats?.textStyles?.underline) {
      styles = { ...styles, textDecoration: "underline" };
    }
    if (vm.model.formats?.textStyles?.strikethrough) {
      styles = { ...styles, textDecoration: "line-through" };
    }
    if (vm.model.formats?.textStyles?.textColor) {
      styles = { ...styles, color: vm.model.formats.textStyles.textColor };
    }
    if (vm.model.formats?.backgroundColor) {
      styles = { ...styles, backgroundColor: vm.model.formats.backgroundColor };
    }

    return styles;
  };

  return (
    <div className="format-options">
      <div className="selected-options">
        {/* <span>{vm.model.formats ? "Has Data" : "No Data"}</span> */}
        {vm.model.formats?.textStyles?.bold && <img className="icon" src={BoldIcon} title="Bold" alt="Bold" />}
        {vm.model.formats?.textStyles?.italic && <img className="icon" src={ItalicIcon} title="Italics" alt="Italics" />}
        {vm.model.formats?.textStyles?.underline && <img className="icon" src={UnderlineIcon} title="Underline" alt="Underline" />}
        {vm.model.formats?.textStyles?.strikethrough && <img className="icon" src={StrikethroughIcon} title="Strikethrough" alt="Strikethrough" />}
        {vm.model.formats?.textStyles?.textColor && <span title="Text color" className="dot text-color" style={{ borderColor: vm.model.formats.textStyles.textColor }}></span>}
        {vm.model.formats?.backgroundColor && (
          <span
            title="Background color"
            className="dot bg-color"
            style={{
              background: vm.model.formats.backgroundColor,
              borderColor: vm.model.formats.backgroundColor,
            }}
          ></span>
        )}
        <div className="edit-options" ref={formatOptionsPopupAnchor}>
          <Button data-automationid={AutomationHelper.GetId("Edit format")} type="button" onClick={() => (vm.model.isPopupVisible ? vm.closePopup() : vm.showPopup())} className="edit-options" imageUrl={EditIcon} fillMode="flat" title="Edit format"></Button>
        </div>
      </div>

      <Popup anchor={formatOptionsPopupAnchor.current} show={vm.model.isPopupVisible} anchorAlign={{ horizontal: "right", vertical: "bottom" }} popupAlign={{ horizontal: "right", vertical: "top" }} collision={{ horizontal: "fit", vertical: "fit" }}>
        <div className="format-options popup-content" ref={popupBoundsRef}>
          <div className="header">
            <span className="title">Formatting</span>
            <span className="delete-btn" onClick={vm.handleDelete}>
              Delete
            </span>
          </div>
          <div className="preview" style={getPreviewStyles()}>
            <span className="text">Preview</span>
          </div>
          <div className="options">
            <div className="row-decor">
              <span>Apply to entire row</span>
              <Switch checked={vm.model.formats.applyToRow} onChange={(e) => vm.handleApplyToEntireRowChange(e.target.value)} />
            </div>
            <div className="text-decor">
              <img title="Bold" className={`icon ${vm.model.formats?.textStyles?.bold ? "selected" : ""}`} src={BoldIcon} onClick={vm.toggleTextBold} alt="Bold" />
              <img title="Italics" className={`icon ${vm.model.formats?.textStyles?.italic ? "selected" : ""}`} src={ItalicIcon} onClick={vm.toggleTextItalics} alt="Italics" />
              <img title="Underline" className={`icon ${vm.model.formats?.textStyles?.underline ? "selected" : ""}`} src={UnderlineIcon} onClick={vm.toggleTextUnderline} alt="Underline" />
              <img title="Strikethrough" className={`icon ${vm.model.formats?.textStyles?.strikethrough ? "selected" : ""}`} src={StrikethroughIcon} onClick={vm.toggleTextStrikethrough} alt="Strikethrough" />
            </div>
            <TabStrip className="color-tabs" selected={vm.model.selectedColorTab} onSelect={(e) => vm.handleColorTabChange(e.selected)}>
              <TabStripTab title="Text">
                <div className="color-selector">
                  <span
                    className="dot text-color"
                    style={{
                      borderColor: !vm.model.formats?.textStyles?.textColor ? "#F0F0F0" : "transparent",
                    }}
                    onClick={() => vm.handleTextTextColorChange("")}
                  >
                    <img title="Bold" className={`none`} src={NoneIcon} alt="Bold" />
                  </span>

                  {defaultColors.map((color) => (
                    <span
                      key={color}
                      data-automationid={AutomationHelper.GetId(`${color}`)}
                      className="dot text-color"
                      style={{
                        borderColor: vm.model.formats?.textStyles?.textColor === color ? color : "transparent",
                      }}
                      onClick={() => vm.handleTextTextColorChange(color)}
                    >
                      <span className="dot bg-color" style={{ backgroundColor: color }}></span>
                    </span>
                  ))}
                </div>
              </TabStripTab>
              <TabStripTab title="Background">
                <div className="color-selector">
                  <span
                    className="dot text-color"
                    style={{
                      borderColor: !vm.model.formats?.backgroundColor ? "#F0F0F0" : "transparent",
                    }}
                    onClick={() => vm.handleBgColorChange("")}
                  >
                    <img title="Bold" className={`none`} src={NoneIcon} alt="Bold" />
                  </span>

                  {defaultColors.map((color) => (
                    <span
                      key={color}
                      className="dot text-color"
                      style={{
                        borderColor: vm.model.formats?.backgroundColor === color ? color : "transparent",
                      }}
                      onClick={() => vm.handleBgColorChange(color)}
                    >
                      <span className="dot bg-color" style={{ backgroundColor: color }}></span>
                    </span>
                  ))}
                </div>
              </TabStripTab>
            </TabStrip>
          </div>
        </div>
      </Popup>
    </div>
  );
};
