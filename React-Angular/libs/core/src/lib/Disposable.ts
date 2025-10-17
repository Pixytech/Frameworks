export interface IDisposable {
  dispose(): void;
}

export function using<T extends IDisposable, R>(
  resource: T,
  callback: (resource: T) => R
): R {
  try {
    return callback(resource);
  } finally {
    resource.dispose();
  }
}

export async function usingAsync<T extends IDisposable, R>(
  resource: T,
  callback: (resource: T) => Promise<R>
): Promise<R> {
  try {
    return await callback(resource);
  } finally {
    resource.dispose();
  }
}
