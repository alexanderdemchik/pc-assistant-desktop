import fs from 'fs';
import path from 'path';
import cp from 'child_process';

const releaseServiceDir = path.join(__dirname, '../release/service');
const serviceBuildDir = path.join(__dirname, '../.webpack');
const serviceSrcDir = path.join(__dirname, '../src/service');
const webpackConfigPath = path.join(__dirname, '../webpack/webpack.config.service.ts');

if (fs.existsSync(releaseServiceDir)) {
  fs.rmSync(releaseServiceDir, { recursive: true, force: true });
}

if (fs.existsSync(serviceBuildDir)) {
  fs.rmSync(serviceBuildDir, { recursive: true, force: true });
}

fs.mkdirSync(releaseServiceDir);

cp.execSync(`npx webpack -c "${webpackConfigPath}"`);
cp.execSync('pkg service.js', { cwd: serviceBuildDir });
cp.execSync('pkg service-installer.js', { cwd: serviceBuildDir });

fs.copyFileSync(path.join(serviceBuildDir, 'service-win.exe'), path.join(releaseServiceDir, 'service.exe'));
fs.copyFileSync(
  path.join(serviceBuildDir, 'service-installer-win.exe'),
  path.join(releaseServiceDir, 'service-installer.exe')
);
fs.copyFileSync(path.join(serviceSrcDir, 'version.json'), path.join(releaseServiceDir, 'version.json'));
fs.copyFileSync(
  path.join(serviceSrcDir, 'binaries/voice_pc_assistant_service.exe'),
  path.join(releaseServiceDir, 'voice_pc_assistant_service.exe')
);
fs.copyFileSync(
  path.join(serviceSrcDir, 'binaries/voice_pc_assistant_service.xml'),
  path.join(releaseServiceDir, 'voice_pc_assistant_service.xml')
);
