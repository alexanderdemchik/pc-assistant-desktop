import { train } from '../src/main/commands-handler/BayesMatcher';
import { writeFile } from 'fs/promises';
import path from 'path';

(async () => {
  const classifier = await train();

  await writeFile(path.join('src/main/commands-handler/data', 'bayes-classifier-ru.json'), JSON.stringify(classifier));
})();
