import * as React from 'react';
import { Dialog } from '@progress/kendo-react-dialogs';
import {
  Form,
  Field,
  FormElement,
  FieldWrapper,
  FormRenderProps,
  FieldRenderProps
} from "@progress/kendo-react-form";
import { Button } from "@progress/kendo-react-buttons";
import { Input, TextArea } from "@progress/kendo-react-inputs";
import {
  Label
} from "@progress/kendo-react-labels";
import CloneBlotterIcon from "../../resources/images/CloneBlotter.svg"

const InputField = (fieldRenderProps: FieldRenderProps) => {
  const { validationMessage, visited, label, type, id, valid, ...others } =
    fieldRenderProps;
  // const showValidationMessage: string | false | null =
  //   visited && validationMessage;
  /* eslint-disable */
  console.info(validationMessage, visited)
  return (
    <FieldWrapper className='field-wrapper'>
      <Label editorId={id} editorValid={valid}>
        {label}
      </Label>
      <Input valid={valid} type={type} id={id} {...others} />
      {/* {!showValidationMessage && (
        <Hint>Enter your personal email address.</Hint>
      )}
      {showValidationMessage && <Error>{validationMessage}</Error>} */}
    </FieldWrapper>
  );
};
const TextareaField = (fieldRenderProps: FieldRenderProps) => {
  const { validationMessage, visited, label, type, id, valid, ...others } =
    fieldRenderProps;
  console.info(validationMessage, visited)
  return (
    <FieldWrapper className='field-wrapper'>
      <Label editorId={id} editorValid={valid}>
        {label}
      </Label>
      <TextArea valid={valid} id={id} {...others} />
    </FieldWrapper>
  );
};
const NewBlotter = ({view, createView}: any) => {
  const [visible, setVisible] = React.useState<boolean>(false)
  const [form, setForm] = React.useState({name: `${view.name} (copy)`, parentBlotter: view.name, description: '', ...view})
  const toggleDialog = () => {
    setVisible(!visible);
  }

  React.useEffect(() => {
    if(form.datasetViewType === "PREDEFINED") {
      delete form.id;
      setForm({...form, datasetViewType: "COPY"})
    }
  }, [form])
  return (
    <>
      <Button
        onClick={toggleDialog}
        className="Blotter_toolbar_buttons"
        imageUrl={CloneBlotterIcon}
      >
        Clone
      </Button>
      {visible && 
      <Dialog className='publish__blotter' width="45%" height="60%" title={"Clone blotter"} onClose={toggleDialog}>
        <Form
          onSubmit={e => [toggleDialog(), createView({...e, datasetViewType: form.datasetViewType})]}
          initialValues={{ ...(form ? {...form, name: `${form.name} (copy)`} : {}) }}
          render={(formRenderProps: FormRenderProps) => {
            return (
              <FormElement>
                <Field
                  id={"blotter"}
                  name={"name"}
                  type="text"
                  label={"Blotter"}
                  className="input_field"
                  placeholder={"Copy of Today’s Activity"}
                  component={InputField}
                />
                <Field
                  id={"parentBlotter"}
                  name={"parentBlotter"}
                  type="text"
                  className="input_field"
                  label={"parent Blotter"}
                  placeholder={"Copy of Today’s Activity"}
                  disabled={true}
                  component={InputField}
                />
                <Field
                  id={"description"}
                  name={"description"}
                  className="input_field"
                  label={"description"}
                  component={TextareaField}
                  rows={3}
                />
                <div className="divider" />
                <h3>Custom Filters</h3>
                <div>
                  <Field
                    id={"search"}
                    name={"search"}
                    type="text"
                    component={InputField}
                    placeholder="+ Add filter"
                  />
                </div>
                <div style={{ textAlign: 'right', marginTop: '1.25rem' }}>
                  <Button type="submit" themeColor={'primary'} disabled={!formRenderProps.allowSubmit} >Save</Button>
                </div>
              </FormElement>
            )
          }}
        />
      </Dialog>}
    </>
  );
}

export default NewBlotter