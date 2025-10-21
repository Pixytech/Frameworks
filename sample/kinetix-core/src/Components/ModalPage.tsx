
import { Window, WindowActionsBar } from "@progress/kendo-react-dialogs";
import { FC } from "react";
import "./ModalPage.scss";
import { useNavigateNoUpdates } from "./NavigationService/NaviationHooks";

interface IModalPageProps {
  title?: React.ReactNode | string;
  showClose?: boolean;
  /**
   * @hidden
   */
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className? :string
  onModelClose?: () => void;
}

export const ModalPage: FC<IModalPageProps> = (props: IModalPageProps) => {
  const navigate = useNavigateNoUpdates();
  return (
    <Window
      stage="FULLSCREEN"
      modal={true}
      resizable={false}
      minimizeButton={() => null}
      closeButton={props.showClose ? undefined : () => null}
      maximizeButton={() => null}
      restoreButton={() => null}
      onClose={(e) => {
        if (props.onModelClose) {
          props.onModelClose();
        } else {
          navigate(-1);
        }
      }}
      className={`borderLessWindow ${props.className ?? ""}`}
      title={props.title}
    >
      <>{props.children}</>

      {props.footer ? <WindowActionsBar layout="end">{props.footer}</WindowActionsBar> : ""}
    </Window>
  );
};
