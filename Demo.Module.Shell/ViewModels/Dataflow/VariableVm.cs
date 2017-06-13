using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Graphnet.Dashboard.WebContracts.Dataflow.Metadata;
using Graphnet.Dashboard.Wpf.Presentation.Infrastructure.Dataflow;
using Graphnet.Dashboard.Wpf.Presentation.Infrastructure.Helpers;
using Graphnet.Wpf.Presentation.Infrastructure;
using Graphnet.Wpf.Presentation.Infrastructure.Commands;
using Graphnet.Wpf.Presentation.Infrastructure.Services.Interfaces;

namespace Graphnet.Dashboard.CoreUI.ViewModels.Dataflow
{
    class VariableVm : ValidatableViewModelBase
    {
        private readonly IDialogService _dialogService;
        private readonly IDispatcher _dispatcher;
        private bool _isInitialized;

        public VariableVm(IDialogService dialogService, IDispatcher dispatcher)
        {
            _dialogService = dialogService;
            _dispatcher = dispatcher;

            Types = new ObservableCollection<VariableType>();

            SaveCommand = new DelegateCommand(() =>
            {
                if (Value == null)
                {
                    Value = ConvertValue(Value, SelectedType.Type);
                }
                CurrentVariable = new VariableModel {Name = VariableName, Type = SelectedType.Type,Value = Value};

                _dialogService.Close(this, true);

            }, Validate);

            CancelCommand = new DelegateCommand(() => _dialogService.Close(this, false), () => true);
        }

        public IEnumerable<MessageMetadata> AvailableMessages { get; set; }

        public IEnumerable<string> ExistingVariablesNames { get; set; }

        public VariableModel CurrentVariable { get; set; }

        public DelegateCommand SaveCommand { get; set; }

        public DelegateCommand CancelCommand { get; set; }

        [Required(AllowEmptyStrings = false, ErrorMessage = "Variable name is required")]
        public string VariableName
        {
            get { return GetProperty<string>(); }
            set
            {
                SetProperty(value); 
                SaveCommand.RaiseCanExecuteChanged();
            }
        }

        protected override async Task OnInitialize()
        {
            if (!_isInitialized)
            {
               
                await _dispatcher.InvokeAsync(() =>
                {
                    AvailableMessages.ForEach(x => AddType(x.Name, x.MessageType));
                    AddPrimitives();

                    if (CurrentVariable != null) // this is edit mode
                    {
                        VariableName = CurrentVariable.Name;
                        SelectedType = Types.FirstOrDefault(x => x.Type == CurrentVariable.Type);
                        Value = CurrentVariable.Value;
                    }
                    _isInitialized = true;
                    SaveCommand.RaiseCanExecuteChanged();

                });
            }
        }

        private void AddPrimitives()
        {
            AddType("Integer", typeof(int));
            AddType("Double", typeof(double));
            AddType("String", typeof(string));
            AddType("Datetime", typeof(DateTime));
            AddType("Boolean", typeof(bool));
            AddType("Long", typeof(long));
            AddType("Timespan", typeof(TimeSpan));
        }

        private void AddType(string name, Type type)
        {
            if (!Types.Any(t => t.Name.Equals(name)))
            {
                Types.Add(new VariableType { Name = name, Type = type });
            }
        }

        protected override bool OnValidate(ICollection<ValidationResult> validationResults)
        {

            if (!string.IsNullOrEmpty(VariableName))
            {
                var existingVariable = ExistingVariablesNames.FirstOrDefault(x => x.Equals(VariableName));
                if (existingVariable != null)
                {
                    validationResults.Add(new ValidationResult("Variable with this name already exists",
                        new List<string>(new[] {"VariableName"})));
                }
            }

            return base.OnValidate(validationResults);
        }

        [Required(AllowEmptyStrings = false, ErrorMessage = "Variable type is required")]
        public VariableType SelectedType
        {
            get { return GetProperty<VariableType>(); }
            set
            {
                SetProperty(value);
                OnPropertyChanged(() => CanSetValue);
                SaveCommand.RaiseCanExecuteChanged();
            }
        }

        public ObservableCollection<VariableType> Types { get; private set; }

        public bool CanSetValue
        {
            get { return SelectedType != null && typeof (IConvertible).IsAssignableFrom(SelectedType.Type); }
        }

        public object Value
        {
            get { return GetProperty<object>(); }
            set
            {
                var convertedValue = ConvertValue(value, SelectedType.Type);
                SetProperty(convertedValue);
                SaveCommand.RaiseCanExecuteChanged();
            }
        }

        private object ConvertValue(object value, Type type)
        {
            
            try
            {
                return Convert.ChangeType(value, type);
            }
            catch (Exception)
            {

                if (type.IsValueType)
                {
                    return Activator.CreateInstance(type);
                }
            }
            return null;

        }
    }
}
