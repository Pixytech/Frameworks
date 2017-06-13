using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Pixytech.Desktop.Presentation.Infrastructure.Properties;

namespace Pixytech.Desktop.Presentation.Infrastructure.Commands
{
    /// <summary>
    /// An <see cref="T:System.Windows.Input.ICommand" /> whose delegates do not take any parameters for <see cref="M:Pixytech.Desktop.Presentation.Infrastructure.Commands.DelegateCommand.Execute" /> and <see cref="M:Pixytech.Desktop.Presentation.Infrastructure.Commands.DelegateCommand.CanExecute" />.
    /// </summary>
    /// <see cref="T:Pixytech.Desktop.Presentation.Infrastructure.Commands.DelegateCommandBase" />
    /// <see cref="T:Pixytech.Desktop.Presentation.Infrastructure.Commands.DelegateCommand`1" />
    public class DelegateCommand : DelegateCommandBase
    {
        /// <summary>
        /// Creates a new instance of <see cref="T:Pixytech.Desktop.Presentation.Infrastructure.Commands.DelegateCommand" /> with the <see cref="T:System.Action" /> to invoke on execution.
        /// </summary>
        /// <param name="executeMethod">The <see cref="T:System.Action" /> to invoke when <see cref="M:System.Windows.Input.ICommand.Execute(System.Object)" /> is called.</param>
        public DelegateCommand(Action executeMethod)
            : this(executeMethod, () => true)
        {
        }
        /// <summary>
        /// Creates a new instance of <see cref="T:Pixytech.Desktop.Presentation.Infrastructure.Commands.DelegateCommand" /> with the <see cref="T:System.Action" /> to invoke on execution
        /// and a <see langword="Func" /> to query for determining if the command can execute.
        /// </summary>
        /// <param name="executeMethod">The <see cref="T:System.Action" /> to invoke when <see cref="M:System.Windows.Input.ICommand.Execute(System.Object)" /> is called.</param>
        /// <param name="canExecuteMethod">The <see cref="T:System.Func`1" /> to invoke when <see cref="M:System.Windows.Input.ICommand.CanExecute(System.Object)" /> is called</param>
        public DelegateCommand(Action executeMethod, Func<bool> canExecuteMethod)
            : base(delegate(object o)
            {
                executeMethod();
            }, (object o) => canExecuteMethod())
        {
            if (executeMethod == null || canExecuteMethod == null)
            {
                throw new ArgumentNullException("executeMethod", Resource.DelegateCommandDelegatesCannotBeNull);
            }
        }
        /// <summary>
        /// Factory method to create a new instance of <see cref="T:Pixytech.Desktop.Presentation.Infrastructure.Commands.DelegateCommand" /> from an awaitable handler method.
        /// </summary>
        /// <param name="executeMethod">Delegate to execute when Execute is called on the command.</param>
        /// <returns>Constructed instance of <see cref="T:Pixytech.Desktop.Presentation.Infrastructure.Commands.DelegateCommand" /></returns>
        public static DelegateCommand FromAsyncHandler(Func<Task> executeMethod)
        {
            return new DelegateCommand(executeMethod);
        }
        /// <summary>
        /// Factory method to create a new instance of <see cref="T:Pixytech.Desktop.Presentation.Infrastructure.Commands.DelegateCommand" /> from an awaitable handler method.
        /// </summary>
        /// <param name="executeMethod">Delegate to execute when Execute is called on the command. This can be null to just hook up a CanExecute delegate.</param>
        /// <param name="canExecuteMethod">Delegate to execute when CanExecute is called on the command. This can be null.</param>
        /// <returns>Constructed instance of <see cref="T:Pixytech.Desktop.Presentation.Infrastructure.Commands.DelegateCommand" /></returns>
        public static DelegateCommand FromAsyncHandler(Func<Task> executeMethod, Func<bool> canExecuteMethod)
        {
            return new DelegateCommand(executeMethod, canExecuteMethod);
        }
        /// <summary>
        ///  Executes the command.
        /// </summary>
        public virtual async Task Execute()
        {
            await base.Execute(null);
        }
        /// <summary>
        /// Determines if the command can be executed.
        /// </summary>
        /// <returns>Returns <see langword="true" /> if the command can execute, otherwise returns <see langword="false" />.</returns>
        public virtual bool CanExecute()
        {
            return base.CanExecute(null);
        }
        private DelegateCommand(Func<Task> executeMethod)
            : this(executeMethod, () => true)
        {
        }
        private DelegateCommand(Func<Task> executeMethod, Func<bool> canExecuteMethod)
            : base((object o) => executeMethod(), (object o) => canExecuteMethod())
        {
            if (executeMethod == null || canExecuteMethod == null)
            {
                throw new ArgumentNullException("executeMethod", Resource.DelegateCommandDelegatesCannotBeNull);
            }
        }
    }
}
