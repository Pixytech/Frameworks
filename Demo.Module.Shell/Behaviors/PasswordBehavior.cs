using System.Linq;
using System.Windows;
using System.Configuration;
using System.Windows.Controls;
using Pixytech.Desktop.Presentation.Behaviors;
using Pixytech.Core.Utilities;
using Pixytech.Core;

namespace Graphnet.Dashboard.CoreUI.Behaviors
{
    public class PasswordBehavior : BehaviorBase<PasswordBox>
    {
        public static readonly DependencyProperty PasswordBoundedProperty = DependencyProperty.Register("PasswordBounded", typeof(string), typeof(PasswordBehavior), new FrameworkPropertyMetadata(null, OnPasswordBoundedChanged));
        private string _encryptionKey;
        private bool _isChanging;
        private IApplicationSettings settingProvider;

        private static void OnPasswordBoundedChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {           
            ((PasswordBehavior)d).UpdatePassword((string)e.NewValue);
        }

        public string PasswordBounded
        {
            get { return (string)GetValue(PasswordBoundedProperty); }
            set { SetValue(PasswordBoundedProperty, value); }
        }

        public string EncryptionKey
        {
            get
            {
                if (string.IsNullOrWhiteSpace(_encryptionKey))
                {
                    _encryptionKey = settingProvider.Read<string>("EncryptionKey",string.Empty);
                }
                return _encryptionKey;
            }
        }

        
        protected override void OnSetup()
        {
            AssociatedObject.PasswordChanged += AssociatedObject_PasswordChanged;
        }

        private IApplicationSettings SettingProvider
        {
            get
            {
                if(settingProvider!= null)
                {
                    this.settingProvider = Pixytech.Core.IoC.ObjectFactory.Builder.Build<IApplicationSettings>();
                }
                return settingProvider;
            }
        }

        private void UpdatePassword(string password)
        {
            if (!_isChanging)
            {
                AssociatedObject.Password = Encryptor.Decrypt(password, EncryptionKey);
            }
        }
        
        void AssociatedObject_PasswordChanged(object sender, RoutedEventArgs e)
        {
            _isChanging = true;
            PasswordBounded = Encryptor.Encrypt(AssociatedObject.Password, EncryptionKey);
            _isChanging = false;
        }

        protected override void OnCleanup()
        {
            AssociatedObject.PasswordChanged -= AssociatedObject_PasswordChanged;
        }
    }
}
