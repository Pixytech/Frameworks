using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Web;

namespace Demo.Helpers
{
    [ComVisible(false)]
    internal class CommandBuilder
    {
        private readonly List<Command> _commands;

        public CommandBuilder()
        {
            _commands = new List<Command>();
        }

        public IEnumerable<Command> Build(List<string> arguments)
        {
            foreach (var argument in arguments)
            {
                //if (argument.StartsWith("/query:?", StringComparison.OrdinalIgnoreCase))
                //{
                //    BuildQueryCommands(argument.Substring("/query:?".Length));
                //}
                //else if (argument.StartsWith("Demoapp://",StringComparison.OrdinalIgnoreCase))
                //{
                //   // BuildProtocolCommands(HttpUtility.UrlDecode(argument).Substring("dashapp://".Length));
                //}
                //else
                { // this is command line argument
                    if (argument.IndexOf("=",StringComparison.OrdinalIgnoreCase)>0)
                    {
                        _commands.Add(new Command(
                                argument.Substring(0, argument.IndexOf("=", StringComparison.OrdinalIgnoreCase)),
                                argument.Substring(argument.IndexOf("=", StringComparison.OrdinalIgnoreCase) + 1)));
                    }
                    else
                    {
                        _commands.Add(new Command(argument, string.Empty));
                    }
                    
                }
            }
            return _commands;
        }

        private void BuildProtocolCommands(string protocolArguments)
        {
            if (!string.IsNullOrEmpty(protocolArguments))
            {
                var parts = protocolArguments.Split(new string[]{" "},StringSplitOptions.RemoveEmptyEntries);
                foreach (var part in parts)
                {
                    if (part.IndexOf("=", StringComparison.OrdinalIgnoreCase) > 0)
                    {
                        var sepratorIndex = part.IndexOf("=", StringComparison.OrdinalIgnoreCase);
                        var key = part.Substring(0, sepratorIndex);
                        var value = part.Substring(sepratorIndex + 1);
                        _commands.Add(new Command(key, value));

                    }
                    else
                    {
                        _commands.Add(new Command(part, string.Empty));
                    }
                }
            }
        }

        //private void BuildQueryCommands(string queryString)
        //{
        //    if (!string.IsNullOrEmpty(queryString))
        //    {
        //        if (queryString.StartsWith("dashapp://", StringComparison.OrdinalIgnoreCase))
        //        {
        //            BuildProtocolCommands(HttpUtility.UrlDecode(queryString).Substring("dashapp://".Length));
        //            return;
        //        }

        //        var parts = HttpUtility.ParseQueryString(queryString);
        //        foreach (var partKey in parts.AllKeys )
        //        {
        //            _commands.Add(new Command(partKey, parts[partKey]));
        //        }
        //    }
        //}
    }
}
