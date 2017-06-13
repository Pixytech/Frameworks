using System.Collections;
using Graphnet.Core.Utilities;
using Graphnet.Dashboard.WebContracts;
using Graphnet.Wpf.Presentation.Controls;

namespace Graphnet.Dashboard.CoreUI.ViewModels.Security
{
    class WebResourceValuesProvider : ISuggestionProvider
    {
        private readonly IWebComponentService _webComponentService;
        public WebResourceValuesProvider(IWebComponentService webComponentService)
        {
            _webComponentService = webComponentService;

        }

        public string ComponentName { get; set; }

        public IEnumerable GetSuggestions(string filter)
        {
            return AsyncHelpers.RunSync(() => _webComponentService.GetResourcesAsync(ComponentName, filter));
        }
    }
}
