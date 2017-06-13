using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Practices.Prism.Regions;
using Microsoft.Practices.ServiceLocation;

namespace Pixytech.Desktop.Presentation.Infrastructure
{
    class ExtendedRegionNavigationContentLoader : RegionNavigationContentLoader
	{
		public ExtendedRegionNavigationContentLoader(IServiceLocator serviceLocator):base(serviceLocator)
		{
		}
		
		protected override IEnumerable<object> GetCandidatesFromRegion(IRegion region, string candidateNavigationContract)
		{
			if (region == null)
			{
				throw new ArgumentNullException("region");
			}
			return 
				from v in region.Views

				where string.Equals(v.GetType().Name, Uri.UnescapeDataString(candidateNavigationContract), StringComparison.Ordinal) 
                || string.Equals(v.GetType().FullName, Uri.UnescapeDataString(candidateNavigationContract), StringComparison.Ordinal)
                || string.Equals(GetViewNameFromType(v.GetType()), Uri.UnescapeDataString(candidateNavigationContract), StringComparison.Ordinal)

				select v;
		}

        private string GetViewNameFromType(Type type)
        {
            return type.AssemblyQualifiedName ?? type.FullName;
        }
	}
}
