import React, { FC } from "react";
import { IIcon } from "./Icons/IIcon";

export interface ITheme {
  Name: string;
  Icon: string;
  PartnersIcons: string[];
  ApplyTheme(children: any): JSX.Element;
}

export interface IThemeAdapter {
  ApplyTheme(theme: ITheme, isChanged: boolean): void;
}
