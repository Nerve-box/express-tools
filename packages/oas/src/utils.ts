export function formatPathToOAS(path: string): string {
  return path.replace(/:([a-zA-Z0-9_]+)/g, '{$1}');
}

export function formatPathFromOAS(path: string): string {
  return path.replace(/\{([^}]+)\}/g, ':$1');
}

export function mergeDefinitions(original: any, updates: any): any {
  original = original || {};

  for (const key of Object.keys(updates)) {
    if (!Object.hasOwn(original, key) || typeof updates[key] !== 'object') original[key] = updates[key];
    else if (original[key] instanceof Array && updates[key] instanceof Array) {
      updates[key].reduce((list, item, index) => {
        if (typeof item === 'object' && item.name) {
          const needle = original[key].findIndex(i => i.name === item.name);
          if (needle >= 0) {
            mergeDefinitions(original[key][needle], list[index]);

            return list;
          }
        }

        list.push(item);
        return list;
      }, original[key]);
    }
    else mergeDefinitions(original[key], updates[key]);
  }
  return original;
}
