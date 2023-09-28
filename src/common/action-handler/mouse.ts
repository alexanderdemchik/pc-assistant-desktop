import { mouse, Button, screen } from '@nut-tree/nut-js';
import { Coords, Direction } from './actionTypes';

type MouseButton = Button;

export async function moveWithDirection(direction: Direction, distance: number) {
  const currentMouseCoords = await mouse.getPosition();

  switch (direction) {
    case Direction.DOWN:
      currentMouseCoords.y += distance;
      break;
    case Direction.UP:
      currentMouseCoords.y -= distance;
      break;
    case Direction.LEFT:
      currentMouseCoords.x -= distance;
      break;
    case Direction.RIGHT:
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
