import { FunctionComponent, SVGProps } from "react";

export interface IIcon {
  name: string,
  icon: FunctionComponent<SVGProps<SVGSVGElement>>
}