export interface INotificationIndicator {
  color?: IndicatorColor;
  text?: string;
}

export enum IndicatorColor {
  Red = "red",
  Green = "green",
  Yellow = "yellow",
  Blue = "blue",
  Purple = "purple",
  Gray = "gray",
}


export abstract class IndicatorColorUtil {
  static readonly toAdjustedColor = (color: IndicatorColor) => {
    switch (color) {
      case IndicatorColor.Red: return "#E8002A";
      case IndicatorColor.Green: return "#07A59B";
      case IndicatorColor.Yellow: return "#FFA51E";
      case IndicatorColor.Blue: return "#0066FF";
      case IndicatorColor.Purple: return "#7D4FB8";
      case IndicatorColor.Gray: return "#A8A6AB";
    }
  }
} 

