export async function delay(timeout: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, timeout);
  });
}


  //Debounce function with return value using promises

  //debounce<T extends (...args: any) => any>(func: T, wait?: number, options?: DebounceSettings): DebouncedFunc<T>;

export function debounceWithResults<T extends (...args: any) => ReturnType<T>>( callback:T, delay:number ) {
  let timer:NodeJS.Timeout;
  
  return( ...args: any ) => {
    return new Promise<ReturnType<T>>( ( resolve, reject ) => {
      clearTimeout(timer);
      timer = setTimeout( () => {
          try {
            let output = callback(...args);
            resolve( output );
          } catch ( err ) {
            reject( err );
          }
      }, delay );
    })
       
  }
}