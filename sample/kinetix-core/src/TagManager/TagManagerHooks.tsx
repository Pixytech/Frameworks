import { useEffect } from "react";
import { useContainer } from "../IoC";
import { ITagManagerService, ITagManagerServiceType } from "./ITagManagerService";
import { useLocationNoUpdates } from "../Components";
import { ITagLogger } from "./ITagAdapter";

export function useCreateTag(data?: { eventName: string; context: any; partyID: string }, logEvent?: () => void): ITagLogger {
  const container = useContainer();
  const location = useLocationNoUpdates();
  const tagManager = container.build<ITagManagerService>(ITagManagerServiceType);

  useEffect(() => {
    try {
      if (data) {
        tagManager.Tag.createEvent(data.eventName, { location: location.pathname, ...data.context });
      } else if (logEvent) {
        logEvent();
      }
    } catch (error) {
      console.error(error);
    }
  }, []);
  return tagManager.Tag;
}
