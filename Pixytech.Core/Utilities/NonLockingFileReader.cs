using System.IO;

namespace Pixytech.Core.Utilities
{
    public static class NonLockingFileReader
    {
        public static byte[] ReadAllBytesWithoutLocking(string path)
        {
            using (var fileStream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite))
            {
                using (var memStream = new MemoryStream())
                {
                    fileStream.CopyTo(memStream);
                    return memStream.ToArray();
                }
            }
        }

        public static string ReadAllTextWithoutLocking(string path)
        {
            using (var fileStream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite))
            {
                using (var textReader = new StreamReader(fileStream))
                {
                    return textReader.ReadToEnd();
                }
            }
        }
    }
}
