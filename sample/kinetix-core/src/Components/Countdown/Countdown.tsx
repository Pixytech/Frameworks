
import { useCountdown } from "../../Hooks/useCountdown";
import "./CountdownStyles.scss";
import { TimePart, TimePartTypes } from "./TimePart";

export interface ICountdownProps {
  targetDate: Date;
  showDays?: boolean;
  showTimerPartLabel?: boolean;
}

export const Countdown = ({ targetDate, showDays = false, showTimerPartLabel = false }: ICountdownProps) => {
  const [days, hours, minutes, seconds] = useCountdown(targetDate);

  return (
    <div className={`kx-countdown ${(days + hours + minutes + seconds <= 0) && "timed-out"}`}>
      {showDays && <><TimePart value={days} type={TimePartTypes.Days} isDanger={days <= 3} showTypeLabel={showTimerPartLabel} /> <span>:</span></>}
      <TimePart value={hours} type={TimePartTypes.Hours} isDanger={false} showTypeLabel={showTimerPartLabel} />
      <span>:</span>
      <TimePart value={minutes} type={TimePartTypes.Minutes} isDanger={false} showTypeLabel={showTimerPartLabel} />
      <span>:</span>
      <TimePart value={seconds} type={TimePartTypes.Seconds} isDanger={false} showTypeLabel={showTimerPartLabel} />
    </div>
  )
}