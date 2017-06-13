using System;
using System.Runtime.Remoting.Contexts;

namespace Pixytech.Core.IoC.Internal
{
    /// <summary>
    /// Invokes methods and actions within a synchronization domain.
    /// </summary>
    [Synchronization(4)]
    public class SynchronizedInvoker : ContextBoundObject
    {
        /// <summary>
        /// The container used to instantiate components.
        /// </summary>
        public IContainer Container
        {
            get;
            set;
        }
        /// <summary>
        /// Uses the container to create the given type and then calls the given
        /// action on the object created.
        /// </summary>
        public void BuildAndDispatch(Type typeToBuild, Action<object> action)
        {
            if (Container == null)
            {
                throw new InvalidOperationException("Cannot perform this action without a Container configured.");
            }
            object o = Container.Build(typeToBuild);
            action(o);
        }
    }
}
