import { IMatcher } from './types';
import trainedModel from './data/trained-nlp-model.json';
import { ActionTypesEnum } from '../action-handler/actionTypes';

const { NlpManager } = require('node-nlp');

const manager = new NlpManager({ languages: ['ru'], forceNER: true });

export class NlpMatcher implements IMatcher {
  constructor() {
    manager.import(trainedModel);
  }
  async match(command: string): Promise<ActionTypesEnum> {
    const result = await manager.process('ru', command);

    return result.intent !== ActionTypesEnum.NONE ? result.intent : null;
  }
}
