import { Point, mouse } from '@nut-tree/nut-js';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

(async () => {
  try {
    await sleep(4000);

    await mouse.leftClick();

    await sleep(5000);

    await mouse.move([new Point(0, 0)]);

    await sleep(5000);

    await mouse.move([new Point(600, 600)]);

    console.log('moved');
  } catch (e) {
    console.log(e);
  }
})();
