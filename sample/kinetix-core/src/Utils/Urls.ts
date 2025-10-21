export const joinPath = (url: string, concat: string): string => {
  console.log(url, concat);
  var url1 = url.split("/");
  var url2 = concat.split("/");
  var url3 = [];
  for (var i = 0, l = url1.length; i < l; i++) {
    if (url1[i] === "..") {
      url3.pop();
    } else if (url1[i] === ".") {
      continue;
    } else {
      url3.push(url1[i]);
    }
  }
  for (var i = 0, l = url2.length; i < l; i++) {
    if (url2[i] === "..") {
      url3.pop();
    } else if (url2[i] === ".") {
      continue;
    } else {
      url3.push(url2[i]);
    }
  }
  return url3.join("/");
};

export function getDistinct<T, K extends keyof T>(
  data: T[],
  property: K
): T[K][] {
  const allValues = data.reduce((values: T[K][], current) => {
    if (current[property]) {
      values.push(current[property]);
    }
    return values;
  }, []);

  return [...new Set(allValues)];
}
