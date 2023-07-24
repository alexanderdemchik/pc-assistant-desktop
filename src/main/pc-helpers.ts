import cp from 'child_process';

export const shutdown = async () => {
  switch (process.platform) {
    case 'win32':
      return cp.execSync('shutdown /s /t 1');
    case 'darwin':
      return cp.execSync('shutdown -h now');
    case 'linux':
      return cp.execSync('shutdown -P now');
  }
};

export const sleep = async () => {
  switch (process.platform) {
    case 'win32':
      return cp.execSync('shutdown /h /t 0');
    case 'darwin':
      return cp.execSync('shutdown -s now');
    case 'linux':
      return cp.execSync('systemctl hibernate');
  }
};

export const restart = async () => {
  switch (process.platform) {
    case 'win32':
      return cp.execSync('shutdown /r /t 1');
    case 'darwin':
      return cp.execSync('shutdown -r now');
    case 'linux':
      return cp.execSync('shutdown -r now');
  }
};
