using System;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Threading;

using Microsoft.Practices.Prism.PubSubEvents;
using Pixytech.Desktop.Presentation.Infrastructure;
using Pixytech.Core.Logging;
using Pixytech.Desktop.Presentation.Infrastructure.Services.Interfaces;
using Pixytech.Desktop.Presentation.Infrastructure.Settings;
using Demo.Presentation.Infrastructure.Services;
using Pixytech.Desktop.Presentation.Infrastructure.Commands;
using Pixytech.Core.IoC;
using System.Threading;

namespace Demo.Module.Shell.ViewModels
{
    class MainWindowVm : ViewModelBase
    {
        private readonly ILog _logger = LogManager.GetLogger(typeof(MainWindowVm));
        private ISettingsProvider _settingsProvider;
        private IDialogService _dialogService;
        private IThemeService _themeService;

        public MainWindowVm(
            IDialogService dialogService, 
            IThemeService themeService, 
            
            ISettingsProvider settingsProvider,
            IRemoteModulesCatalog remoteModulesCatalog)
        {
            _settingsProvider = settingsProvider;
            _dialogService = dialogService;
          
            _themeService = themeService;
            ErrorWindowCommand = new DelegateCommand(OnShowErrorWindow);
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
           
        }

        protected override async Task OnInitialize()
        {
            Task.Run(() =>
            {
                while (true)
                {
                    Message = DateTime.Now.Ticks.ToString();
                    Thread.Sleep(TimeSpan.FromSeconds(20));
                }
            });
            await Task.CompletedTask;
        }

        protected override void OnCleanup()
        {
          
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

        public string Message
        {
            get { return GetProperty<string>(); }
            set
            {
                SetProperty(value);
                OnPropertyChanged(() => Message);
            }
        }

        public bool ShowNoModulesUi
        {
            get { return !HasModules; }
        }

       
        //   public IErrorContainer Container
        //{
        //    get { return _errorContainer; }
        //}

        public DelegateCommand SettingsCommand { get; private set; }

        public DelegateCommand LogonDetailsCommand { get; private set; }
    }
}
