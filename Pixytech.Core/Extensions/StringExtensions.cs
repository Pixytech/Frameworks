using System;
using Pixytech.Core.Utilities;

namespace Pixytech.Core.Extensions
{
    public static class StringExtensions
    {
        /// <summary>
        /// Convert string to guid, for more details see DeterministicGuid
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        public static Guid ToGuid(this string data)
        {
            return DeterministicGuid.MakeId(data);
        }
    }
}
