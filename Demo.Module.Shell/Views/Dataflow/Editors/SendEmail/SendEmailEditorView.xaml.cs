using System.Windows.Controls;
using System.Windows.Input;
using Graphnet.Dashboard.CoreUI.ViewModels.Dataflow.Editors.SendEmail;

namespace Graphnet.Dashboard.CoreUI.Views.Dataflow.Editors.SendEmail
{
    /// <summary>
    /// Interaction logic for RuleMiddlewareEditor.xaml
    /// </summary>
    public partial class SendEmailEditorView : UserControl
    {
        public SendEmailEditorView()
        {
            InitializeComponent();
        }

        //private void MenuCommand_Executed(object sender, ExecutedRoutedEventArgs e)
        //{
        //    var cmdParam =  e.Parameter as string;
        //    //if (cmdParam != null)
        //        //DoStuff...
        //}

        //private void ModernButton_Click(object sender, System.Windows.RoutedEventArgs e)
        //{
        //    if (TemplateDataFields.SelectedItem != null)
        //    {
        //        var data = (ContextData)(TemplateDataFields.SelectedItem);
        //        TemplateBodyText.Text = TemplateBodyText.Text.Insert(TemplateBodyText.CaretIndex, data.Name);

        //    }
        //}
    }
}
