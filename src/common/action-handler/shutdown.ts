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
