import { FormAutoComplete, FormAutoCompleteField, UpdateSourceTrigger } from "../../../Forms";

export interface IConfigurationEditorSearchColumnProps {
  dataContext: FormAutoCompleteField;
}

export const ConfigurationEditorSearchColumn = (props: IConfigurationEditorSearchColumnProps) => {
  return (
    <>
      <div className="search-input">
        <FormAutoComplete
          updateSourceTrigger={UpdateSourceTrigger.PropertyChanged}
          placeholder="+ Search columns"
          dataContext={props.dataContext}
          clearButton={false}
          columns={[
            {
              field: "displayName",
            },
          ]}
        />
      </div>
    </>
  );
};
