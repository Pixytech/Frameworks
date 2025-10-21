import { State } from "@progress/kendo-data-query";
import { DataTypes, RxDataFilter, toCompositeDataFilter } from "../Data";
import { api } from "./api";
import { getRxFilters } from "./serverFilters";
import { IDatasetDefinition } from "../Blotter";
import { AuthenticationService } from "@kinetix/core";

//todo : this this blotter related code is in shared lib ?

export const getFilters = (dataState: State, datasetDefinition: IDatasetDefinition): RxDataFilter[] => {
  const compositeFilter = dataState.filter;

  const filterParams = compositeFilter
    ? getRxFilters(
        toCompositeDataFilter(compositeFilter, (field: string, _value: any) => {
          const column = datasetDefinition?.columns?.find((y: any) => y.name === field) || datasetDefinition?.columns?.find((y: any) => y.displayField === field);
          if (column) {
            if (column.type == DataTypes.list || column.type == DataTypes.enum) {
              return DataTypes.string;
            }
            return column.type;
          } else {
            return DataTypes.string;
          }
        })
      )
    : [];

  console.debug("Final Filter Exp", filterParams);
  return filterParams;
};

export const dataService = {
  getDatasets: async () => {
    return await api(`/datasets`);
  },
  getDatasetDefinition: async (name: any) => {
    return await api(`/datasets/${name}`);
  },
  getDatasetData: async (name: any) => {
    return await api(`/data/${name}?count=100&offset=0`);
  },

  getDatasetDataByLookup: async (dataset: any, query: string | undefined) => {
    // Get the parsed token to check for client information
    const token = AuthenticationService.Instance.GetParsedToken();
    
    // For internal-legalentities, use limit=100 and add clientId
    if (dataset === 'internal-legalentities') {
      const clientId = token?.ClientId;
      // Only add query parameter if user is typing (query is defined and not empty)
      const queryString = query ? `&query=${query}` : '';
      return await api(`/reference_data/lookup?datasetID=${dataset}${queryString}&limit=100&clientId=${clientId}`);
    }
    
    // For other datasets (counterparty, jurisdictions), use original behavior
    return await api(`/reference_data/lookup?datasetID=${dataset}${query ? `&query=${query}` : ""}&limit=50`);
  },

  getUsers: async () => {
    return await api(`/users`);
  },
  updateDatasets: async (view: any) => {
    return await api(`/dataset_views`, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
        userId: view.userId,
      },

      redirect: "follow", // manual, *follow, error
      referrerPolicy: "no-referrer", // no-
      body: JSON.stringify(view),
    });
  },
  removeDataset: async (id: string) => {
    return await api(`/dataset_views/${id}`, {
      method: "DELETE", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow", // manual, *follow, error
      referrerPolicy: "no-referrer", // no-
    });
  },
  getDatasetViews: async (userId: any) => {
    //TODO: this should not be required as server already have logged in user as part of api call
    return await api(`/dataset_views`, {
      headers: {
        userId: userId,
      },
    });
  },
  getContextMenu: async (raw: any) => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    return await api(`/entity/actions`, {
      method: "POST",
      headers: myHeaders,
      body: raw,
    });
  },
  getDatasetDataByRequest: async (name: any, skip: any, take: any, searchAfterNext: any[], datasetDefinition: any, userId: string, dataState: State = {}, url: string = "/data/search?") => {
    const request = {
      datasetId: name,
      parameters: [...getFilters(dataState, datasetDefinition)],
      sorts: dataState.sort?.map((s) => {
        return { sortBy: s.field, sortOrder: s.dir };
      }),
    };

    let endpoint = `${url}offset=${skip}&count=${take}&searchAfter=${JSON.stringify(searchAfterNext)}&request=${encodeURIComponent(JSON.stringify(request))}`;

    return await api(endpoint, {
      method: "GET",
      headers: {
        userId: userId,
        //     "Access-Control-Allow-Origin": "*",
        //     "Content-Type": "application/json",
      },
    });
  },
};
