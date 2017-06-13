using System;
using System.Threading.Tasks;
using Graphnet.Dashboard.WebContracts.Dataflow;
using Graphnet.Dashboard.Wpf.Presentation.Infrastructure.Dataflow;

namespace Graphnet.Dashboard.CoreUI.ViewModels.Dataflow.Editors.SendEmail
{
    internal interface ISendEmailOptionsVm
    {
         bool IsVariableCheckRequired { get; set; }

        VariableModel EmailRequiredVariable { get; set; }

        IMiddlewareOptionBase MiddlewareOption { get; set; }

        bool HasData { get; }

        void SelectEmailData(VariableModel variable);

        Task InitializeVm();

        bool Validate();

        Action RequestValidationAction { get; set; }

        void RequestValidation();

        void ClearEmailRequiredVariable();
    }
}
