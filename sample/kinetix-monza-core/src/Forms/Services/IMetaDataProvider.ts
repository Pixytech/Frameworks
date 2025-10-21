export interface IMetaDataProvider {
  getMetaData(path: string): Promise<any>;
  /**
   * get global app state, variables across app accessible to all components
   *
   */
  get<T>(variableName: string): T;
  getAll():any;
  set<T>(variableName: string, value: T): void;
}
