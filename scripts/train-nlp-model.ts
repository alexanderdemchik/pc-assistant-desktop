import { writeFileSync } from 'fs';
import path from 'path';
import { DefaultCommandsEnum } from '../src/main/commands-handler/types';

const { NlpManager } = require('node-nlp');

const manager = new NlpManager({ languages: ['ru'], forceNER: true });

async function train() {
  const defaultCommandsTokensMap = {
    [DefaultCommandsEnum.SHUTDOWN]: ['выключи', 'выключи компьютер'],
    [DefaultCommandsEnum.RESTART]: ['перезагрузи', 'рестарт'],
    [DefaultCommandsEnum.SLEEP]: ['переведи в спящий режим', 'спящий', 'сон'],
  };

  Object.keys(defaultCommandsTokensMap).forEach((command) => {
    defaultCommandsTokensMap[command].forEach((token) => {
      manager.addDocument('ru', token, command);
    });
  });

  await manager.train();

  return manager.export();
}

(async () => {
  const manager = await train();

  writeFileSync(path.join('src/main/commands-handler/data', 'trained-nlp-model.json'), manager);
})();
