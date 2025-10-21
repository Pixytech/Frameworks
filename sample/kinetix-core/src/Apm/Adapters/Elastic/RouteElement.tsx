import { apm, Transaction } from "@elastic/apm-rum";
import React, { FC } from "react";
import RouterUtils, { useLocationNoUpdates } from "../../../Components/NavigationService/NaviationHooks";
import { IRouteElementProps } from "../../IApmAdapter";

const RAF_TIMEOUT = 100;

/**
 * Schedule a callback to be invoked after the browser paints a new frame.
 *
 * There are multiple ways to do this like double rAF, MessageChannel, But we
 * use the requestAnimationFrame + setTimeout
 *
 * Also, RAF does not fire if the current tab is not visible, so we schedule a
 * timeout in parallel to ensure the callback is invoked
 *
 * Based on the  code from preact!
 * https://github.com/preactjs/preact/blob/f6577c495306f1e93174d69bd79f9fb8a418da75/hooks/src/index.js#L285-L297
 */
function afterFrame(callback: { (): void | undefined; (): void }) {
  const handler = () => {
    clearTimeout(timeout);
    cancelAnimationFrame(raf);
    setTimeout(callback);
  };
  const timeout = setTimeout(handler, RAF_TIMEOUT);

  const raf = requestAnimationFrame(handler);
}

export const RouteElement: FC<IRouteElementProps> = (
  props: IRouteElementProps
) => {
  const isActive = apm.isActive();
  console.debug("apm is Active", isActive);
  return <>{isActive ? <ApmRouteElement {...props} /> : props.route.element()}</>;
};

const ApmRouteElement: FC<IRouteElementProps> = (props: IRouteElementProps) => {
  const location = useLocationNoUpdates();
  const transactionName = location.pathname;

  const routeLabel = {
    parent: props.parent,
    text: `${props.route.text}`,
    path: props.route.path,
    link: `${props.route.link}`,
    icon: `${props.route.icon}`,
    exclude: `${props.route.exclude}`,
  };

  const [transactionState] = React.useState(() => {
    const tr = apm.startTransaction(transactionName, "route-change", {
      managed: true,
      canReuse: true,
    });

    return tr;
  });

  const detectFinish = (transaction: Transaction): void => {
    /**
     * Ends the transaction when there are no pending tasks
     * and transaction state is not blocked
     */
    if (transaction.isFinished()) transaction.end();
  };

  /**
   * React guarantees the parent component effects are run after the child components effects
   * So once all the child components effects are run, we run the detectFinish logic
   * which ensures if the transaction can be completed or not.
   */
  React.useEffect(() => {
    console.debug("closing transaction");
    afterFrame(() => transactionState && detectFinish(transactionState));
    return () => {
      /**
         * Incase the transaction is never ended, we check if the transaction
         * can be closed during unmount phase
         *
         /**
       * Ends the transaction when there are no pending tasks
       * and transaction state is not blocked
         */
      transactionState && detectFinish(transactionState);
    };
  }, []);

  React.useEffect(() => {
    const currentTransaction = apm.getCurrentTransaction();
    if (currentTransaction) {
      console.debug(
        `Adding span ${transactionName} to transaction ${currentTransaction.name}`
      );
      // bear in mind that a transaction needs at least one span
      const span = currentTransaction.startSpan(transactionName);

      span?.addLabels(routeLabel);
      const spanCloser = () => {
        span?.end();
        detectFinish(currentTransaction);
        console.debug(
          `finishing span ${transactionName} for transaction ${currentTransaction.name}`
        );
      };

      afterFrame(() => spanCloser());
      return () => {
        spanCloser();
      };
    } else {
      console.debug("No active transaction");
    }
  });

  console.debug("rending elastic route");
  
  return <RouterUtils>{props.route.element()}</RouterUtils>;
};
