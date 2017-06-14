using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Pixytech.Desktop.Presentation.Infrastructure
{
    public interface INeedSyncronization
    {
        object SyncLock { get; }
    }
}
