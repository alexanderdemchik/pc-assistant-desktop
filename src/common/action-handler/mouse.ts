import { mouse, Button, screen } from '@nut-tree/nut-js';
import { Coords } from './actionTypes';

enum MouseDirection {
  UP = 'UP',
  BOTTOM = 'BOTTOM',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

type MouseButton = Button;

export async function moveWithDirection(direction: MouseDirection, distance: number) {
  const currentMouseCoords = await mouse.getPosition();

  switch (direction) {
    case MouseDirection.BOTTOM:
      currentMouseCoords.y += distance;
      break;
    case MouseDirection.UP:
      currentMouseCoords.y -= distance;
      break;
    case MouseDirection.LEFT:
      currentMouseCoords.x -= distance;
      break;
    case MouseDirection.RIGHT:
      currentMouseCoords.x += distance;
  }

  await mouse.move([currentMouseCoords]);
}

export async function move(coords: Coords) {
  await mouse.move([coords]);
}

export async function click(button: MouseButton, double = false) {
  console.log(await screen.capture('screen'));

  if (!double) {
    await mouse.doubleClick(button);
  } else {
    await mouse.click(button);
  }
}
