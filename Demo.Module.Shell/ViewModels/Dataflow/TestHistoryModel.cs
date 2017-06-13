using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using Graphnet.Core.Logging;
using Graphnet.Dashboard.CoreUI.Models;
using Graphnet.Dashboard.WebContracts.Dataflow;
using Graphnet.Wpf.Presentation.Infrastructure;
using Newtonsoft.Json;

namespace Graphnet.Dashboard.CoreUI.ViewModels.Dataflow
{
    class TestHistoryModel : ViewModelBase
    {
        public string TemplateName { get; set; }
        private readonly ILog _logger = LogManager.GetLogger(typeof(TestHistoryModel));
        
        public DataflowMessageWrapper MessagesMetadata { get; set; }


        internal IEnumerable<MessageModel> GetMessageModel()
        {
            var messagesType = typeof (IEnumerable<>).MakeGenericType(MessagesMetadata.MessageType);

            var result = new List<MessageModel>();

            try
            {
                var messages = JsonConvert.DeserializeObject(MessagesMetadata.SerializedMessages, messagesType);



                if (messages is IEnumerable)
                {
                    var dataFlowMessages = (messages as IEnumerable).Cast<IDataflowMessage>().ToList();


                    int index = 0;
                    foreach (var dataflowMessage in dataFlowMessages)
                    {
                        result.Add(new MessageModel()
                        {
                            Message = dataflowMessage,
                            DisplayName = string.Format("{0} {1}", dataflowMessage.GetType().Name, index + 1)

                        });
                        index += 1;
                    }

                }
            }
            catch (Exception exception)
            {
                _logger.Error("Error Getting Message Model", exception);
            }

             return result;
            
        }
    }
}
