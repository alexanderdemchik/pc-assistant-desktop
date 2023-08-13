const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function waitFor(callback: () => Promise<void>, interval = 1000, maxTries = 10) {
  let tryNum = 0;

  while (tryNum < maxTries) {
    try {
      await callback();
      break;
    } catch (e) {
      await sleep(interval);

      tryNum++;

      if (tryNum === maxTries) {
        throw e;
      }
    }
  }
}
