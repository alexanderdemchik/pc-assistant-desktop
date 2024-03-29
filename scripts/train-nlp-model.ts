import { writeFileSync } from 'fs';
import path from 'path';
import { ActionTypesEnum } from '../src/common/action-handler/actionTypes';

const { NlpManager } = require('node-nlp');

const manager = new NlpManager({ languages: ['ru'], forceNER: true });

async function train() {
  const defaultActionsTokensMap = {
    [ActionTypesEnum.SHUTDOWN]: ['выключи', 'выключи компьютер'],
    [ActionTypesEnum.RESTART]: ['перезагрузи', 'рестарт'],
    [ActionTypesEnum.SLEEP]: ['переведи в спящий режим', 'спящий', 'сон'],
    [ActionTypesEnum.MOUSE_MOVE]: [
      'передвинь мышь вверх на 100 пикселей',
      'передвинь мышь вниз на 200 пикселей',
      'передвинь мышь вправо на 40 пикселей',
      'передвинь мышь влево на 1 пиксель',
    ],
  };

  Object.keys(defaultActionsTokensMap).forEach((action) => {
    defaultActionsTokensMap[action].forEach((token) => {
      manager.addDocument('ru', token, action);
    });
  });

  await manager.train();

  return manager.export();
}

(async () => {
  const manager = await train();

  writeFileSync(path.join('./src/common/action-matchers/data', 'trained-nlp-model.json'), manager);
})();
