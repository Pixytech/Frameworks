using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Graphnet.Dashboard.Wpf.Presentation.Infrastructure.Services.LiveFeed;
using Graphnet.Wpf.Presentation.Infrastructure;
using Graphnet.Wpf.Presentation.Infrastructure.Commands;
using Microsoft.Practices.Prism.PubSubEvents;

namespace Graphnet.Dashboard.CoreUI.ViewModels
{
    internal class MatrixVm : ViewModelBase
    {
        private readonly IMessageFeedService _messageFeedService;
        private SubscriptionToken _stateChangeSubscription;

        public MatrixVm(IMessageFeedService messageFeedService, IComponentBuilder componentBuilder)
        {
            ResetLiveFeedCommand = DelegateCommand.FromAsyncHandler(OnResetLiveFeed, CanResetLiveFeed);
            _messageFeedService = messageFeedService;

            var components = componentBuilder.Build().Where(component => component.Matrix.Any()).ToList();

            Components = components;
        }

        protected override Task OnInitialize()
        {
            return Task.Run(()=> _stateChangeSubscription = _messageFeedService.OnStateChanged(e => OnPropertyChanged(() => IsConnected)));
        }

        protected override void OnCleanup()
        {
            _stateChangeSubscription.Dispose();
        }

        private async Task OnResetLiveFeed()
        {
            await Task.Factory.StartNew(() =>
            {
                IsBusy = true;
                _messageFeedService.Stop();
            });

            await _messageFeedService.ConnectAsync();
        }

        private bool CanResetLiveFeed()
        {
            return !IsBusy;
        }

        public bool IsConnected { get { return _messageFeedService.IsConnected; } }

        public bool IsBusy
        {
            get { return GetProperty<bool>(); }
            set { SetProperty(value); }
        }

        public IEnumerable<Wpf.Presentation.Infrastructure.IComponent> Components
        {
            get { return GetProperty <IEnumerable<Wpf.Presentation.Infrastructure.IComponent>>(); }
            private set { SetProperty(value); }
        }

        public DelegateCommand ResetLiveFeedCommand { get; private set; }
    }
}
