using Graphnet.Dashboard.WebContracts.Dataflow.TemplateParsing;
using Graphnet.Wpf.Presentation.Infrastructure;


namespace Graphnet.Dashboard.CoreUI.ViewModels.Dataflow.Editors.SendEmail
{
    public class AggregatedRecipient : ViewModelBase
    {
        public EmailRecipient Recipient { get; set; }
        public string RecipientType { get; set; }
    }
}