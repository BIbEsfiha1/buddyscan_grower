export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, g) => g.toUpperCase());
}

export function convertKeysToCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(v => convertKeysToCamelCase(v));
  } else if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [snakeToCamel(k), convertKeysToCamelCase(v)])
    );
  }
  return obj;
}
