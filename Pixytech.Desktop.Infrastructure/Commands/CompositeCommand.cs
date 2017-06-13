using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Input;
using Pixytech.Desktop.Presentation.Infrastructure.Properties;
using Microsoft.Practices.Prism;

namespace Pixytech.Desktop.Presentation.Infrastructure.Commands
{
    /// <summary>
    /// The CompositeCommand composes one or more ICommands.
    /// </summary>
    public class CompositeCommand : ICommand
    {
        private readonly List<ICommand> registeredCommands = new List<ICommand>();
        private readonly bool monitorCommandActivity;
        private readonly EventHandler onRegisteredCommandCanExecuteChangedHandler;
        private List<WeakReference> _canExecuteChangedHandlers;
        /// <summary>
        /// Occurs when any of the registered commands raise <see cref="E:System.Windows.Input.ICommand.CanExecuteChanged" />. You must keep a hard
        /// reference to the handler to avoid garbage collection and unexpected results. See remarks for more information.
        /// </summary>
        /// <remarks>
        /// When subscribing to the <see cref="E:System.Windows.Input.ICommand.CanExecuteChanged" /> event using 
        /// code (not when binding using XAML) will need to keep a hard reference to the event handler. This is to prevent 
        /// garbage collection of the event handler because the command implements the Weak Event pattern so it does not have
        /// a hard reference to this handler. An example implementation can be seen in the CompositeCommand and CommandBehaviorBase
        /// classes. In most scenarios, there is no reason to sign up to the CanExecuteChanged event directly, but if you do, you
        /// are responsible for maintaining the reference.
        /// </remarks>
        /// <example>
        /// The following code holds a reference to the event handler. The myEventHandlerReference value should be stored
        /// in an instance member to avoid it from being garbage collected.
        /// <code>
        /// EventHandler myEventHandlerReference = new EventHandler(this.OnCanExecuteChanged);
        /// command.CanExecuteChanged += myEventHandlerReference;
        /// </code>
        /// </example>
        public event EventHandler CanExecuteChanged
        {
            add
            {
                WeakEventHandlerManager.AddWeakReferenceHandler(ref this._canExecuteChangedHandlers, value, 2);
            }
            remove
            {
                WeakEventHandlerManager.RemoveWeakReferenceHandler(this._canExecuteChangedHandlers, value);
            }
        }
        /// <summary>
        /// Gets the list of all the registered commands.
        /// </summary>
        /// <value>A list of registered commands.</value>
        /// <remarks>This returns a copy of the commands subscribed to the CompositeCommand.</remarks>
        public IList<ICommand> RegisteredCommands
        {
            get
            {
                IList<ICommand> result;
                lock (this.registeredCommands)
                {
                    result = this.registeredCommands.ToList<ICommand>();
                }
                return result;
            }
        }
        /// <summary>
        /// Initializes a new instance of <see cref="T:Pixytech.Desktop.Presentation.Infrastructure.Commands.CompositeCommand" />.
        /// </summary>
        public CompositeCommand()
        {
            this.onRegisteredCommandCanExecuteChangedHandler = new EventHandler(this.OnRegisteredCommandCanExecuteChanged);
        }
        /// <summary>
        /// Initializes a new instance of <see cref="T:Pixytech.Desktop.Presentation.Infrastructure.Commands.CompositeCommand" />.
        /// </summary>
        /// <param name="monitorCommandActivity">Indicates when the command activity is going to be monitored.</param>
        public CompositeCommand(bool monitorCommandActivity)
            : this()
        {
            this.monitorCommandActivity = monitorCommandActivity;
        }
        /// <summary>
        /// Adds a command to the collection and signs up for the <see cref="E:System.Windows.Input.ICommand.CanExecuteChanged" /> event of it.
        /// </summary>
        ///  <remarks>
        /// If this command is set to monitor command activity, and <paramref name="command" /> 
        /// implements the <see cref="!:IActiveAwareCommand" /> interface, this method will subscribe to its
        /// <see cref="!:IActiveAwareCommand.IsActiveChanged" /> event.
        /// </remarks>
        /// <param name="command">The command to register.</param>
        public virtual void RegisterCommand(ICommand command)
        {
            if (command == null)
            {
                throw new ArgumentNullException("command");
            }
            if (command == this)
            {
                throw new ArgumentException(Resource.CannotRegisterCompositeCommandInItself);
            }
            lock (this.registeredCommands)
            {
                if (this.registeredCommands.Contains(command))
                {
                    throw new InvalidOperationException(Resource.CannotRegisterSameCommandTwice);
                }
                this.registeredCommands.Add(command);
            }
            command.CanExecuteChanged += this.onRegisteredCommandCanExecuteChangedHandler;
            this.OnCanExecuteChanged();
            if (this.monitorCommandActivity)
            {
                IActiveAware activeAware = command as IActiveAware;
                if (activeAware != null)
                {
                    activeAware.IsActiveChanged += new EventHandler(this.Command_IsActiveChanged);
                }
            }
        }
        /// <summary>
        /// Removes a command from the collection and removes itself from the <see cref="E:System.Windows.Input.ICommand.CanExecuteChanged" /> event of it.
        /// </summary>
        /// <param name="command">The command to unregister.</param>
        public virtual void UnregisterCommand(ICommand command)
        {
            if (command == null)
            {
                throw new ArgumentNullException("command");
            }
            bool flag2;
            lock (this.registeredCommands)
            {
                flag2 = this.registeredCommands.Remove(command);
            }
            if (flag2)
            {
                command.CanExecuteChanged -= this.onRegisteredCommandCanExecuteChangedHandler;
                this.OnCanExecuteChanged();
                if (this.monitorCommandActivity)
                {
                    IActiveAware activeAware = command as IActiveAware;
                    if (activeAware != null)
                    {
                        activeAware.IsActiveChanged -= new EventHandler(this.Command_IsActiveChanged);
                    }
                }
            }
        }
        private void OnRegisteredCommandCanExecuteChanged(object sender, EventArgs e)
        {
            this.OnCanExecuteChanged();
        }
        /// <summary>
        /// Forwards <see cref="M:System.Windows.Input.ICommand.CanExecute(System.Object)" /> to the registered commands and returns
        /// <see langword="true" /> if all of the commands return <see langword="true" />.
        /// </summary>
        /// <param name="parameter">Data used by the command.
        /// If the command does not require data to be passed, this object can be set to <see langword="null" />.
        /// </param>
        /// <returns><see langword="true" /> if all of the commands return <see langword="true" />; otherwise, <see langword="false" />.</returns>
        public virtual bool CanExecute(object parameter)
        {
            bool result = false;
            ICommand[] array;
            lock (this.registeredCommands)
            {
                array = this.registeredCommands.ToArray();
            }
            ICommand[] array2 = array;
            for (int i = 0; i < array2.Length; i++)
            {
                ICommand command = array2[i];
                if (this.ShouldExecute(command))
                {
                    if (!command.CanExecute(parameter))
                    {
                        return false;
                    }
                    result = true;
                }
            }
            return result;
        }
        /// <summary>
        /// Forwards <see cref="M:System.Windows.Input.ICommand.Execute(System.Object)" /> to the registered commands.
        /// </summary>
        /// <param name="parameter">Data used by the command.
        /// If the command does not require data to be passed, this object can be set to <see langword="null" />.
        /// </param>
        public virtual void Execute(object parameter)
        {
            Queue<ICommand> queue;
            lock (this.registeredCommands)
            {
                queue = new Queue<ICommand>(this.registeredCommands.Where(new Func<ICommand, bool>(this.ShouldExecute)).ToList<ICommand>());
                goto IL_4E;
            }
        IL_40:
            ICommand command = queue.Dequeue();
            command.Execute(parameter);
        IL_4E:
            if (queue.Count <= 0)
            {
                return;
            }
            goto IL_40;
        }
        /// <summary>
        /// Evaluates if a command should execute.
        /// </summary>
        /// <param name="command">The command to evaluate.</param>
        /// <returns>A <see cref="T:System.Boolean" /> value indicating whether the command should be used 
        /// when evaluating <see cref="M:Pixytech.Desktop.Presentation.Infrastructure.Commands.CompositeCommand.CanExecute(System.Object)" /> and <see cref="M:Pixytech.Desktop.Presentation.Infrastructure.Commands.CompositeCommand.Execute(System.Object)" />.</returns>
        /// <remarks>
        /// If this command is set to monitor command activity, and <paramref name="command" />
        /// implements the <see cref="!:IActiveAwareCommand" /> interface, 
        /// this method will return <see langword="false" /> if the command's <see cref="!:IActiveAwareCommand.IsActive" /> 
        /// property is <see langword="false" />; otherwise it always returns <see langword="true" />.</remarks>
        protected virtual bool ShouldExecute(ICommand command)
        {
            IActiveAware activeAware = command as IActiveAware;
            return !this.monitorCommandActivity || activeAware == null || activeAware.IsActive;
        }
        /// <summary>
        /// Raises <see cref="E:System.Windows.Input.ICommand.CanExecuteChanged" /> on the UI thread so every 
        /// command invoker can requery <see cref="M:System.Windows.Input.ICommand.CanExecute(System.Object)" /> to check if the
        /// <see cref="T:Pixytech.Desktop.Presentation.Infrastructure.Commands.CompositeCommand" /> can execute.
        /// </summary>
        protected virtual void OnCanExecuteChanged()
        {
            WeakEventHandlerManager.CallWeakReferenceHandlers(this, this._canExecuteChangedHandlers);
        }
        /// <summary>
        /// Handler for IsActiveChanged events of registered commands.
        /// </summary>
        /// <param name="sender">The sender.</param>
        /// <param name="e">EventArgs to pass to the event.</param>
        private void Command_IsActiveChanged(object sender, EventArgs e)
        {
            this.OnCanExecuteChanged();
        }
    }
}
