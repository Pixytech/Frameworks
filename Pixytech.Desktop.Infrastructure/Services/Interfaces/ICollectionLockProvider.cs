using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Pixytech.Desktop.Presentation.Infrastructure.Services.Interfaces
{
    public interface ICollectionLockProvider
    {
        object GetLock(IEnumerable collection);
    }
}
