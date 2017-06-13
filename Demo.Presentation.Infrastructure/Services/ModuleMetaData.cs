using System.Collections.Generic;

namespace Demo.Presentation.Infrastructure.Services
{
    public class ModuleMetaData
    {
        public string Name { get; set; }
        public string Reference { get; set; }
        public IEnumerable<string> DepedendsOn { get; set; }
        public IEnumerable<string> Pages { get; set; }
        public bool IsCoreComponent { get; set; }
    }
}
