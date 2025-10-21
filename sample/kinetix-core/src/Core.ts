export interface Selector<TSource, TResult>
{
	(source:TSource):TResult;
}

/* Encapsulates a method that has a single parameter and does not return a value. 
* @T typeoof EventBase
*/

export interface Action<T> extends Selector<T, void>
{
}

/* Provides a mechanism for releasing resources */
export interface IDisposable
{
	dispose():void;
}

export class DisposableAction implements IDisposable
{
  private readonly callback: Action<void>;
  constructor(callback:Action<void>){
    this.callback=callback;
  }
  dispose(): void {
    this.callback();
  }
  
}

export class CompositeDisposable implements IDisposable
{
  private readonly disposables:IDisposable[]=[];
  
  constructor(disposables:IDisposable[]=[]){
    this.disposables = disposables
  }

  add(disposable:IDisposable):void{
    this.disposables.push(disposable);
  }

  addRange(disposables:IDisposable[]){
    this.disposables.push(...disposables);
  }

  dispose(): void {
    this.disposables.forEach(item=>{item.dispose()})
  }
  
}
export function using<T extends IDisposable>(resource: T, func: (resource: T) => void) {
  try {
      func(resource);
  } finally {
      resource.dispose();
  }
}

export async function usingAsync<T extends IDisposable, U>(resource: T, func: (resource: T) => Promise<U>) {
  try {
      return await func(resource);
  } finally {
      await resource.dispose();
  }
}

export interface Type<T> {
  new (...args: any[]): T;
}

/**
 * Identifier for the registered type/instance.
 */
 export declare type Token<T = any> = Type<T> | string | symbol;

 /**
  * checks whethere identifier is Normal or not (`true` if its string or symbol)
  * @param [token] identifier of registration type
  * @returns normal token 
  */
 export declare function isNormalToken(
   token?: Token<any>,
 ): token is string | symbol;
 
 /**
  * Determines whether token descriptor is
  * @param descriptor 
  * @returns token descriptor 
  */
 export declare function isTokenDescriptor(
   descriptor: any,
 ): descriptor is TokenDescriptor;
 
 
 /**
  * Token descriptor
  */
 export interface TokenDescriptor {
   token: Token<any>;
   multiple: boolean;
 }
 
 /** 
 * Utility functions around Type 
 */
export class TypeDescriptor {
  /** 
  * Create instance from given type with default constructor
  * @template T
  */
  static create<T>(typeinfo: Type<T>): T {
    return new typeinfo();
  }
}

