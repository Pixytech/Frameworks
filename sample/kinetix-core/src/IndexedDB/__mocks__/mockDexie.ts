// Mock for Dexie to prevent IndexedDB operations during tests

export class MockTable {
  name: string;
  
  constructor(name: string) {
    this.name = name;
  }
  
  get = jest.fn().mockResolvedValue(null);
  where = jest.fn().mockReturnThis();
  equals = jest.fn().mockReturnThis();
  first = jest.fn().mockResolvedValue(null);
  toArray = jest.fn().mockResolvedValue([]);
  add = jest.fn().mockResolvedValue(1);
  put = jest.fn().mockResolvedValue(1);
  update = jest.fn().mockResolvedValue(1);
  delete = jest.fn().mockResolvedValue(undefined);
  clear = jest.fn().mockResolvedValue(undefined);
  count = jest.fn().mockResolvedValue(0);
  each = jest.fn();
  filter = jest.fn().mockReturnThis();
  limit = jest.fn().mockReturnThis();
  offset = jest.fn().mockReturnThis();
  orderBy = jest.fn().mockReturnThis();
  reverse = jest.fn().mockReturnThis();
  sortBy = jest.fn().mockResolvedValue([]);
  toCollection = jest.fn().mockReturnThis();
  anyOf = jest.fn().mockReturnThis();
  below = jest.fn().mockReturnThis();
  above = jest.fn().mockReturnThis();
  between = jest.fn().mockReturnThis();
}

export class MockDexie {
  name: string;
  tables: { [key: string]: MockTable } = {};
  
  constructor(name?: string) {
    this.name = name || 'MockDB';
  }
  
  version = jest.fn().mockReturnThis();
  stores = jest.fn().mockImplementation((schema: any) => {
    Object.keys(schema).forEach(tableName => {
      this.tables[tableName] = new MockTable(tableName);
      (this as any)[tableName] = this.tables[tableName];
    });
    return this;
  });
  
  open = jest.fn().mockResolvedValue(this);
  close = jest.fn();
  delete = jest.fn().mockResolvedValue(undefined);
  isOpen = jest.fn().mockReturnValue(true);
  hasBeenClosed = jest.fn().mockReturnValue(false);
  hasFailed = jest.fn().mockReturnValue(false);
  table = jest.fn((name: string) => this.tables[name] || new MockTable(name));
  transaction = jest.fn().mockImplementation((mode: string, tables: any, fn: Function) => {
    return Promise.resolve(fn());
  });
  
  on = {
    ready: jest.fn(),
    error: jest.fn(),
    blocked: jest.fn(),
    versionchange: jest.fn(),
  };
  
  use = jest.fn().mockReturnThis();
}

// Export as default and named export
const Dexie = MockDexie;
export default Dexie;
export { Dexie };

// Mock Table type
export type Table<T = any, TKey = any> = MockTable;