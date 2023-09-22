import cp from 'child_process';

export const sleep = async () => {
  switch (process.platform) {
    case 'win32':
      return cp.execSync('rundll32.exe powrprof.dll, SetSuspendState Sleep');
    case 'darwin':
      return cp.execSync('shutdown -s now');
    case 'linux':
      return cp.execSync('systemctl hibernate');
  }
};
