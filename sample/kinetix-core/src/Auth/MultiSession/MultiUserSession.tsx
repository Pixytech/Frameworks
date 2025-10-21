import { FC } from "react";
import { useViewModelInstance } from "../../Mvvm";
import { MultiUserSessionViewModel } from "./MultiUserSessionViewModel";
import { Button } from "@progress/kendo-react-buttons";
import "./MultiUserSession.scss"
interface IMultiUserSessionProps {
  dataContext: MultiUserSessionViewModel;
}

export const MultiUserSession: FC<IMultiUserSessionProps> = (props: IMultiUserSessionProps) => {
  const dataContext = useViewModelInstance(props.dataContext);
  return <div className="multi-session-content">
    <span className="message">
      Looks like you signed in to the application elsewhere.
      Keep working there, or sign in again on this device.
      You will be signed out of this application automatically in <span className="time">{dataContext.model.countdown}</span> seconds.
    </span>
    <div className="actions">
      <Button onClick={()=>dataContext.signin.execute()} themeColor={"primary"}>Sign in</Button>
    </div>
  </div>    ;
  
};
