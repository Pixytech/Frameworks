export enum DataTypes {
  string = "string",

  int = "int",
  numeric = "numeric",
  long = "long",
  number = "number",

  boolean = "boolean",

  date = "date",
  dateTime = "dateTime",

  enum = "enum",
  complexObject = "complexObject",

  list = "list",
}

export function isDataTypeNumber(type: DataTypes): boolean {
  return (
    type === DataTypes.number ||
    type === DataTypes.int ||
    type === DataTypes.long ||
    type === DataTypes.numeric
  );
}
