import fs from 'fs';
import path from 'path';

type Cache = { [key: string]: any };

function ensureDirectoryExistence(filePath: string) {
  const directory = path.dirname(filePath);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

function serializeArguments(args: any[]): string {
  const serializedArgs = args.map((arg) => {
    if (typeof arg === 'function') {
      return arg.toString();
    }
    return JSON.stringify(arg);
  });
  return serializedArgs.join(':');
}

function loadCache(cacheFile: string): Cache {
  try {
    const cacheData = fs.readFileSync(cacheFile, 'utf8');
    return JSON.parse(cacheData);
  } catch (error) {
    return {};
  }
}

function saveCache(cacheFile: string, cache: Cache): void {
  ensureDirectoryExistence(cacheFile);
  fs.writeFileSync(cacheFile, JSON.stringify(cache), 'utf8');
}

function cacheFetch(cacheFile: string) {
  const cacheFileFullPath = `./data/cache/${cacheFile}.json`;
  return function (target: any, name: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = serializeArguments(args);
      console.log(cacheKey)
      cache = loadCache(cacheFileFullPath);
      if (cache[cacheKey]) {
        console.log('Retrieved from cache');
        return cache[cacheKey];
      } else {
        const result = await originalMethod.apply(this, args);
        cache[cacheKey] = result;
        saveCache(cacheFileFullPath, cache);
        console.log('Added to cache');
        return result;
      }
    };
    let cache = loadCache(cacheFileFullPath);

    return descriptor;
  };
}

export default cacheFetch;