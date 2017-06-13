namespace Demo.Installer
{
    interface IPlatformInstaller
    {
        void Install(string applicationId);
        bool UnInstall(string applicationId);
    }
}
