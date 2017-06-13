using System;

namespace Pixytech.Core.Isolation
{
    [Serializable]
    public class PluginWorker<TIn, TOut> : MarshalByRefObject , IPluginContract
    {

        public TOut Execute(TIn input, Func<TIn, TOut> method)
        {
            return method(input);
        }
    }
}
