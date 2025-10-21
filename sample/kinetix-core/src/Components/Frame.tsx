import { ReactNode, FC, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import "./Frame.scss";

interface FrameProps {
  children: ReactNode;
  src?: string;
  className?: string;
}

export const Frame: FC<FrameProps> = (props: FrameProps) => {
  const src = props.src;
  const contentRef = useRef<any>(null);
  const [portalConent, setPortalContent] = useState<any>(null);

  useEffect(() => {
    if (contentRef.current) {
      const mountNode = contentRef.current?.contentWindow?.document?.body;
      let content = mountNode ? createPortal(props.children, mountNode) : createPortal(props.children, contentRef.current);
      setPortalContent(content);
      //console.debug("portal updated");
    }
  }, [props.children]);

  return src ? (
    <iframe  className={ `portal-frame ${props.className}`} {...props} ref={contentRef} src={src}>
      {portalConent}
    </iframe>
  ) : (
    <div className={props.className} ref={contentRef}>
      {portalConent}
    </div>
  );
};
