import { DefaultCommandsEnum, IMatcher } from './types';
import { BayesClassifier, PorterStemmerRu } from 'natural';
import ru_classifier from './data/bayes-classifier-ru.json';

export async function train() {
  const defaultCommandsTokensMap = {
    [DefaultCommandsEnum.SHUTDOWN]: ['выключи', 'выключи компьютер'],
    [DefaultCommandsEnum.RESTART]: ['перезагрузи', 'рестарт'],
    [DefaultCommandsEnum.SLEEP]: [PorterStemmerRu.tokenizeAndStem('переведи в спящий режим'), 'спящий', 'сон'],
  };

  const classifier = new BayesClassifier(PorterStemmerRu);

  Object.keys(defaultCommandsTokensMap).forEach((command) => {
    classifier.addDocument(defaultCommandsTokensMap[command], command);
  });

  return new Promise((resolve) => {
    classifier.events.on('trainedWithDocument', function () {
      resolve(classifier);
    });
    classifier.train();
  });
}

const classifier = BayesClassifier.restore(ru_classifier as unknown as BayesClassifier, PorterStemmerRu);

export class BayesMatcher implements IMatcher {
  match(command: string): string {
    console.log(classifier.getClassifications(command));
    return null;
  }
}

new BayesMatcher().match('переведи в спящий режим');
