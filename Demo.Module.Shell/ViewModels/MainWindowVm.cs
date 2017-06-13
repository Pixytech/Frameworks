using System;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Threading;
using Graphnet.Core.IoC;
using Graphnet.Core.Logging;
using Graphnet.Dashboard.Wpf.Presentation.Infrastructure;
using Graphnet.Dashboard.Wpf.Presentation.Infrastructure.ExceptionManagement;
using Graphnet.Dashboard.Wpf.Presentation.Infrastructure.Services;
using Graphnet.Dashboard.Wpf.Presentation.Infrastructure.Services.LiveFeed;
using Graphnet.Wpf.Presentation.Infrastructure;
using Graphnet.Wpf.Presentation.Infrastructure.Commands;
using Graphnet.Wpf.Presentation.Infrastructure.Services.Interfaces;
using Graphnet.Wpf.Presentation.Infrastructure.Settings;
using Graphnet.Wpf.Presentation.Services;
using Microsoft.Practices.Prism.PubSubEvents;

namespace Graphnet.Dashboard.CoreUI.ViewModels
{
    class MainWindowVm : ViewModelBase
    {
        private readonly ILog _logger = LogManager.GetLogger(typeof(MainWindowVm));
        private readonly IErrorContainer _errorContainer;
        private DispatcherTimer _hideTimer;
        private readonly IDialogService _dialogService;
        private readonly ErrorWindowVm _errorWindowViewModel;
        private readonly IThemeService _themeService;
        private SubscriptionToken _errorSubscription;
        private readonly IMessageFeedService _messageFeedService;
        private readonly ISettingsProvider _settingsProvider;
        
        public MainWindowVm(IErrorContainer errorContainer, 
            IDialogService dialogService, 
            ErrorWindowVm errorWindowViewModel,
            IThemeService themeService, 
            IMessageFeedService messageFeedService, 
            ISettingsProvider settingsProvider,
            IRemoteModulesCatalog remoteModulesCatalog)
        {
            _settingsProvider = settingsProvider;
            _messageFeedService = messageFeedService;
            _dialogService = dialogService;
            _errorWindowViewModel = errorWindowViewModel;
            _errorContainer = errorContainer;
            _themeService = themeService;
            ErrorWindowCommand = new DelegateCommand(OnShowErrorWindow, () => _errorContainer.HasErrors);
            SettingsCommand = new DelegateCommand(OnShowSettings);
            LogonDetailsCommand = new DelegateCommand(OnShowLogonDetails);
            HasModules = remoteModulesCatalog.Modules.Count() > 1;
            _logger.InfoFormat("Initialized with module count {0}", remoteModulesCatalog.Modules.Count());

            var themeSettings = settingsProvider.GetSettings<ThemeSettings>();
            if (!string.IsNullOrEmpty(themeSettings.Name))
            {
                var theme = _themeService.Themes.FirstOrDefault(x => x.Name == themeSettings.Name);
                if (theme != null)
                {
                    _themeService.CurrenTheme = theme;
                    theme.AccentColor = themeSettings.AccentColor;
                    theme.FontSize = themeSettings.FontSize;
                }
            }
        }

        private void OnShowLogonDetails()
        {
            var logonDetailsViewModel = ObjectFactory.Builder.Build<LogonDetailsWindowVm>();
            _dialogService.ShowDialog(logonDetailsViewModel, new DialogOptions { ActivateParentAfterClose = true, AutoHideHeader = false, IsHeaderVisible = true, IsTitleVisible = true, Title = "Logon Details" });
        }

        protected override async Task OnInitialize()
        {
            _errorSubscription = _errorContainer.SubscribeOnError(e =>
            {
                _logger.ErrorFormat("ErrorContainer recieved error {0}", e);
                OnPropertyChanged(() => Container);
                LastException = e;
                RecentErrorRecieved = true;
                if (_hideTimer != null)
                {
                    _hideTimer.Stop();
                }
                _hideTimer = new DispatcherTimer(TimeSpan.FromSeconds(3), DispatcherPriority.Background, (s, ex) =>
                {
                    _hideTimer.Stop();
                    RecentErrorRecieved = false;

                }, Dispatcher.CurrentDispatcher);
                _hideTimer.Start();

                ErrorWindowCommand.RaiseCanExecuteChanged();
            });

           await _messageFeedService.ConnectAsync();
        }

        protected override void OnCleanup()
        {
            _messageFeedService.Stop();
            _errorSubscription.Dispose();
        }

        private void OnShowSettings()
        {
            var beforeChangeTheme = _themeService.CurrenTheme;
            var beforeChangeAccentColor = _themeService.CurrenTheme.AccentColor;
            var beforeChangeFontSize = _themeService.CurrenTheme.FontSize;
            

            if (_themeService.CustomizeTheme())
            {
                var currrentTheme = _themeService.CurrenTheme;
                _settingsProvider.SaveSettings(new ThemeSettings()
                {
                    AccentColor = currrentTheme.AccentColor,
                    FontSize = currrentTheme.FontSize,
                    Name = currrentTheme.Name
                });
            }
            else
            {
                _themeService.CurrenTheme = beforeChangeTheme;
                _themeService.CurrenTheme.AccentColor = beforeChangeAccentColor;
                _themeService.CurrenTheme.FontSize = beforeChangeFontSize;
               
            }
        }


        private void OnShowErrorWindow()
        {
            _dialogService.ShowDialog(_errorWindowViewModel, new DialogOptions { ActivateParentAfterClose = true, AutoHideHeader = false, IsHeaderVisible = true, IsTitleVisible = true, Title = "Recent Errors" });
        }

        public DelegateCommand ErrorWindowCommand { get; set; }

        public Exception LastException
        {
            get { return GetProperty<Exception>(); }
            set { SetProperty(value); }
        }
        public bool RecentErrorRecieved
        {
            get { return GetProperty<bool>(); }
            set { SetProperty(value); }
        }

        public bool HasModules
        {
            get { return GetProperty<bool>(); }
            set
            {
                SetProperty(value); 
                OnPropertyChanged(() => ShowNoModulesUi);
            }
        }

        public bool ShowNoModulesUi
        {
            get { return !HasModules; }
        }

       

        public IErrorContainer Container
        {
            get { return _errorContainer; }
        }

        public DelegateCommand SettingsCommand { get; private set; }

        public DelegateCommand LogonDetailsCommand { get; private set; }
    }
}
