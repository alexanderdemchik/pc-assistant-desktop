export default {
    info: API.sendLogByIPC('info'),
    error: API.sendLogByIPC('error'),
    debug: API.sendLogByIPC('debug'),
}