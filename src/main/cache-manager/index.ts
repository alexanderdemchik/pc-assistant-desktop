import fs from 'fs/promises';
import path from 'path';
import { app } from 'electron';
import { ICache } from './types';
import { logger } from '../logger';

function reviver(key, value) {
  if (key === 'datetime') {
    return new Date(value);
  }

  return value;
}

let cache: ICache = {
  commandsLog: [],
};

let initiliazed = false;

function getCacheFilePath() {
  return path.join(app.getPath('userData'), 'cache.json');
}

async function checkForInit() {
  if (!initiliazed) {
    try {
      const parsedCache = JSON.parse((await fs.readFile(getCacheFilePath())).toString(), reviver);

      cache = parsedCache;
    } catch (error) {
      logger.error(error);
    } finally {
      initiliazed = true;
    }
  }
}

export async function set(key: keyof ICache, value: ICache[keyof ICache]) {
  await checkForInit();

  cache[key] = value;

  try {
    await fs.writeFile(getCacheFilePath(), JSON.stringify(cache));
  } catch (e) {
    logger.error(e);
  }

  return cache[key];
}

export async function get(key: keyof ICache): Promise<ICache[keyof ICache]> {
  await checkForInit();

  return cache[key];
}
