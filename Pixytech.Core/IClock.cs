using System;

namespace Pixytech.Core
{
    public interface IClock
    {
        DateTime UtcNow { get; }

        DateTime Now { get; }
    }
}
