import React, { useEffect, useState } from 'react';
import { IViewModelBase, IPropertyChanged } from '@mlp/core';

// Helper type to extract props from a React component
type ComponentProps<T> = T extends React.ComponentType<infer P> ? P : never;

interface ReactiveProps<
  TViewModel extends IViewModelBase<any> = IViewModelBase<any>,
  TComponent extends React.ComponentType<any> = React.ComponentType<any>
> {
  /** The ViewModel instance (data context) */
  dataContext: TViewModel;
  /** The property name(s) that trigger re-renders. If null, triggers on all property changes */
  trigger: keyof TViewModel['model'] | (keyof TViewModel['model'])[] | null;
  /** The component to wrap */
  component: TComponent;
  /** Props to pass to the wrapped component */
  componentProps?: Partial<ComponentProps<TComponent>>;
  /** Function to get component props from the ViewModel (optional if props are passed directly) */
  getProps?: () => Partial<ComponentProps<TComponent>>;
}

/**
 * Generic ReactiveComponent that wraps any existing component and makes it reactive.
 * It infers all props from the wrapped component and adds reactive functionality.
 * 
 * TypeScript will now properly infer the component props, providing full intellisense
 * and type checking for all props of the wrapped component.
 * 
 * @example
 * <ReactiveComponent
 *   dataContext={context}
 *   trigger="count"
 *   component={Statistic}
 *   title="Count"           // ✅ TypeScript knows this is a valid Statistic prop
 *   value={context.model.count}  // ✅ TypeScript knows this is a valid Statistic prop
 *   prefix={<PlusOutlined />}    // ✅ TypeScript knows this is a valid Statistic prop
 * />
 * 
 * @example
 * <ReactiveComponent
 *   dataContext={context}
 *   trigger={["count", "isLoading"]}
 *   component={Button}
 *   type="primary"          // ✅ TypeScript knows this is a valid Button prop
 *   onClick={() => context.incrementCommand.execute()}  // ✅ TypeScript knows this is a valid Button prop
 *   children="Increment"    // ✅ TypeScript knows this is a valid Button prop
 * />
 */
export function ReactiveComponent<
  TViewModel extends IViewModelBase<any>,
  TComponent extends React.ComponentType<any>
>({ 
  dataContext,
  trigger,
  component: Component,
  componentProps = {},
  getProps = () => ({}),
  ...restProps
}: ReactiveProps<TViewModel, TComponent> & Partial<ComponentProps<TComponent>>): React.ReactElement {
  const [, updateComponent] = useState({});

  useEffect(() => {
    const subscription = dataContext.onModelChanged.subscribe((change: IPropertyChanged) => {
      // If trigger is null, re-render on any property change
      if (trigger === null) {
        updateComponent({});
        return;
      }

      // Convert trigger to array of strings
      const propertiesToWatch = Array.isArray(trigger) ? trigger.map(p => p as string) : [trigger as string];
      
      // Check if any of the watched properties have changed
      const hasRelevantChange = propertiesToWatch.some(prop => 
        change.names.includes(prop)
      );

      if (hasRelevantChange) {
        updateComponent({});
      }
    });

    return () => subscription.unsubscribe();
  }, [dataContext, trigger]);

  // Re-evaluate props on each render to ensure they're reactive
  const modelProps = getProps();
  const finalProps = {
    ...componentProps,
    ...restProps,
    ...modelProps
  };

  return <Component {...(finalProps as any)} />;
}
