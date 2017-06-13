using System;
using System.IO;
using Pixytech.Core.Logging;

namespace Demo.Presentation.Infrastructure.Services
{
    public class  WebServerUrlProvider : IWebServerUrlProvider
    {
        private readonly ILog _logger = LogManager.GetLogger(typeof(WebServerUrlProvider));
        private readonly IAppDeployment _applicationDeployment;

        public WebServerUrlProvider(IAppDeployment applicationDeployment)
        {
            _applicationDeployment = applicationDeployment;
        }
        public string HostBaseAddress
        {
            get
            {
                    var baseUri = _applicationDeployment.UpdateLocation;
                    var absoluteUri = new Uri(baseUri, "../../");
                    var hostBaseAddress = absoluteUri.ToString();
                
                _logger.InfoFormat("Host Base address {0}, IsNetworkDeployed:{1}", hostBaseAddress, _applicationDeployment.IsNetworkDeployed);
                return hostBaseAddress;
            }
        }
    }
}
