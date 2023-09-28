import { ActionEventPayloadMap, ActionTypesEnum, Direction } from '../action-handler/actionTypes';

export function extractActionPayload(action: ActionTypesEnum, command: string) {
  const actionExtractors = {
    [ActionTypesEnum.MOUSE_MOVE]: extractMouseMovePayload,
  };

  return actionExtractors[action]?.(command) || null;
}

function extractMouseMovePayload(command: string): ActionEventPayloadMap[ActionTypesEnum.MOUSE_MOVE] {
  let direction: Direction;
  let distance: number;

  const directionMatchWords = {
    [Direction.UP]: ['вверх', 'верх'],
    [Direction.DOWN]: ['вниз', 'низ'],
    [Direction.LEFT]: ['влево', 'лево'],
    [Direction.RIGHT]: ['вправо', 'право'],
  };

  for (const dir of Object.keys(directionMatchWords)) {
    if (directionMatchWords[dir].some((word) => command.toLowerCase().includes(word))) {
      direction = dir as Direction;
    }
  }

  const splitted = command.split(' ');

  for (const word of splitted) {
    if (!isNaN(Number(word))) {
      distance = Number(word);
    }
  }

  if (!direction || !distance) return null;

  return {
    direction,
    distance,
  };
}
