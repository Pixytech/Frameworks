import React, { useEffect, useState } from 'react';
import { ICommand } from '@mlp/core';

interface CommandButtonProps {
  command?: ICommand;
  commandParameter?: any;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  children?: React.ReactNode;
  onCommandExecuted?: (parameter?: any) => void;
}

export function CommandButton({
  command,
  commandParameter,
  className = '',
  type = 'button',
  children,
  onCommandExecuted
}: CommandButtonProps): React.ReactElement {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    if (command) {
      const subscription = command.onCanExecuteChanged.subscribe(() => {
        forceUpdate({});
      });

      return () => subscription.unsubscribe();
    }
  }, [command]);

  const handleClick = () => {
    if (command && command.canExecute(commandParameter)) {
      command.execute(commandParameter);
      onCommandExecuted?.(commandParameter);
    }
  };

  return (
    <button
      type={type}
      className={className}
      disabled={!command?.canExecute(commandParameter)}
      onClick={handleClick}
    >
      {children}
    </button>
  );
}
