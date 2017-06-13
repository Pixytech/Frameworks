using System;
using System.Collections.Generic;
using System.Threading;

namespace Pixytech.Desktop.Presentation.Infrastructure.Commands
{
    /// <summary>
    /// Handles management and dispatching of EventHandlers in a weak way.
    /// </summary>
    public static class WeakEventHandlerManager
    {
        private static readonly SynchronizationContext SyncContext = SynchronizationContext.Current;
        /// <summary>
        ///  Invokes the handlers 
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="handlers"></param>
        public static void CallWeakReferenceHandlers(object sender, List<WeakReference> handlers)
        {
            if (handlers != null)
            {
                var array = new EventHandler[handlers.Count];
                int num = 0;
                num = CleanupOldHandlers(handlers, array, num);
                for (int i = 0; i < num; i++)
                {
                    CallHandler(sender, array[i]);
                }
            }
        }
        private static void CallHandler(object sender, EventHandler eventHandler)
        {
            if (eventHandler != null)
            {
                if (SyncContext != null)
                {
                    SyncContext.Post(o => eventHandler(sender, EventArgs.Empty), null);
                    return;
                }
                eventHandler(sender, EventArgs.Empty);
            }
        }
        private static int CleanupOldHandlers(List<WeakReference> handlers, EventHandler[] callees, int count)
        {
            for (int i = handlers.Count - 1; i >= 0; i--)
            {
                var weakReference = handlers[i];
                var eventHandler = weakReference.Target as EventHandler;
                if (eventHandler == null)
                {
                    handlers.RemoveAt(i);
                }
                else
                {
                    callees[count] = eventHandler;
                    count++;
                }
            }
            return count;
        }
        /// <summary>
        ///  Adds a handler to the supplied list in a weak way.
        /// </summary>
        /// <param name="handlers">Existing handler list.  It will be created if null.</param>
        /// <param name="handler">Handler to add.</param>
        /// <param name="defaultListSize">Default list size.</param>
        public static void AddWeakReferenceHandler(ref List<WeakReference> handlers, EventHandler handler, int defaultListSize)
        {
            if (handlers == null)
            {
                handlers = ((defaultListSize > 0) ? new List<WeakReference>(defaultListSize) : new List<WeakReference>());
            }
            handlers.Add(new WeakReference(handler));
        }
        /// <summary>
        ///  Removes an event handler from the reference list.
        /// </summary>
        /// <param name="handlers">Handler list to remove reference from.</param>
        /// <param name="handler">Handler to remove.</param>
        public static void RemoveWeakReferenceHandler(List<WeakReference> handlers, EventHandler handler)
        {
            if (handlers != null)
            {
                for (int i = handlers.Count - 1; i >= 0; i--)
                {
                    WeakReference weakReference = handlers[i];
                    var eventHandler = weakReference.Target as EventHandler;
                    if (eventHandler == null || eventHandler == handler)
                    {
                        handlers.RemoveAt(i);
                    }
                }
            }
        }
    }
}
