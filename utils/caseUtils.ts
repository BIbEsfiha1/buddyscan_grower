export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, g => g[1].toUpperCase());
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
