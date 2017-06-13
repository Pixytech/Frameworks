using System.Runtime.InteropServices;

namespace Pixytech.Desktop.Presentation.Helpers.Win32
{
    [StructLayout(LayoutKind.Sequential)]
    internal struct RECT
    {
        public int left, top, right, bottom;
    }
}
