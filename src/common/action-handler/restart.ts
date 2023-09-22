import cp from 'child_process';

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
