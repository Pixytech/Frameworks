using System;

namespace Pixytech.Desktop.Presentation.Infrastructure.Modulatiry
{
    public static class StreamExtensions
    {
        public static System.IO.MemoryStream CopyStream(this System.IO.Stream source)
        {
            var copy = new System.IO.MemoryStream();
            if (source != null && source.CanRead)
            {
                byte[] buffer = new byte[Convert.ToInt32(2048) + 1];
                while (true)
                {
                    int read = source.Read(buffer, 0, buffer.Length);
                    if (read <= 0)
                    {
                        break;
                    }
                    copy.Write(buffer, 0, read);
                }
            }
            copy.Position = 0;
            return copy;
        }
    }
}
