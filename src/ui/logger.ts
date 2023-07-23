import { sendLogByIPC } from './api';

export default {
    info: sendLogByIPC('info'),
    error: sendLogByIPC('error'),
    debug: sendLogByIPC('debug'),
};
