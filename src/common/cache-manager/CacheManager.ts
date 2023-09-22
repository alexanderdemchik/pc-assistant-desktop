import fs from 'fs/promises';
import path from 'path';
import { ICache } from './types';
import { logger } from '../../main/logger';

function reviver(key, value) {
  if (key === 'datetime') {
    return new Date(value);
  }

  return value;
}

const CACHE_FILE_NAME = 'cache.json';

export class CacheManager {
  private path: string;
  private cache: ICache;
  private initialized = false;

  constructor(folderPath: string) {
    this.path = path.join(folderPath, CACHE_FILE_NAME);
  }

  async init() {
    try {
      const parsedCache = JSON.parse((await fs.readFile(this.path)).toString(), reviver);

      this.cache = parsedCache;
      this.initialized = true;
    } catch (error) {
      logger.error(error);
    }

    return this;
  }

  async set(key: keyof ICache, value: ICache[keyof ICache]) {
    this.cache[key] = value;

    if (this.initialized) {
      try {
        await fs.writeFile(this.path, JSON.stringify(this.cache));
      } catch (e) {
        logger.error(e);
      }
    }

    return this.cache[key];
  }

  async get(key: keyof ICache): Promise<ICache[keyof ICache]> {
    return this.cache[key];
  }
}
