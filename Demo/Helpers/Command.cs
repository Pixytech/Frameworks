using System.Runtime.InteropServices;

namespace Demo.Helpers
{
    [ComVisible(false)]
    internal class Command
    {
        public Command(string action, string argument)
        {
            Action = action.ToLower();
            Argument = argument;
        }

        public string Action { get; private set; }
        public string Argument { get; private set; }
    }
}
