export interface ITimePartProps {
  value: number;
  type: TimePartTypes;
  isDanger: boolean;
  showTypeLabel: boolean;
}

export enum TimePartTypes {
  Days,
  Hours,
  Minutes,
  Seconds,
}

const getTimePartTypeText = (type: TimePartTypes): string => {
  switch (type) {
    case TimePartTypes.Days:
      return "d";
    case TimePartTypes.Hours:
      return "h";
    case TimePartTypes.Minutes:
      return "m";
    case TimePartTypes.Seconds:
      return "s";
    default:
      return "";
  }
}

export const TimePart = ({ value, type, isDanger, showTypeLabel }: ITimePartProps) => {
  return (
    <div className={isDanger ? 'time-part danger' : 'time-part'}>
      <span>{value.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false })}</span> {showTypeLabel && <span>{getTimePartTypeText(type)}</span>}
    </div>
  );
};