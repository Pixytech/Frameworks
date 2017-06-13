using System;
using System.Security;

namespace Pixytech.Core.Isolation.Hosting
{
    internal sealed class ActivationWorker : MarshalByRefObject, IDisposable
    {
        private readonly IPluginToken _pipeline;
        
        [SecuritySafeCritical]
        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        private void Dispose(bool disposing)
        {
        }

        ~ActivationWorker()
        {
			Dispose(false);
		}


        public override object InitializeLifetimeService()
        {
            return null;
        }

        [SecuritySafeCritical]
        internal T Activate<T>() where T: IPluginContract
        {
            var type = typeof (T);
            var result = Activator.CreateInstance(type.Assembly.FullName, type.FullName).Unwrap();
            return (T) result;
        }

        internal ActivationWorker(IPluginToken pipeline)
        {
            _pipeline = pipeline;
        }

    }
}
