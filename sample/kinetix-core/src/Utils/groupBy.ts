export const groupBy = <T, K extends keyof any>(list: T[], getKey: (item: T) => K) =>
  list.reduce((previous, currentItem) => {
    const group = getKey(currentItem);
    if (!previous[group]) previous[group] = [];
    previous[group].push(currentItem);
    return previous;
  }, {} as Record<K, T[]>);

export function groupByItetrable<T>(list: T[], getKey: (item: T) => string) {
  const groupedData: Record<string, T[]> = groupBy(list, getKey);
  const groupedResult: { key: string; data: T[] }[] = [];
  Object.keys(groupedData).forEach((key) => {
    const item = groupedData[key];
    groupedResult.push({ key: key, data: item });
  });
  return groupedResult;
}
