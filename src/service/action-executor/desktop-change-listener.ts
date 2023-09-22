import { listenDesktopChange } from 'native_lib';

listenDesktopChange(function () {
  process.stdout.write('desktop changed');
});
