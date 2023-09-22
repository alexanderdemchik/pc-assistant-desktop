import fs from 'fs';
import path from 'path';
import cp from 'child_process';
import { ACTION_EXECUTOR_APP_NAME, DESKTOP_CHANGE_LISTENER_APP_NAME } from '../src/common/constants/appNames';

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

console.log('build webpack');
cp.execSync(`npx webpack -c "${webpackConfigPath}"`);

console.log('copy node modules folder');
fs.cpSync('./release/app/node_modules', './.webpack/node_modules', { recursive: true });
fs.copyFileSync('./src/service/action-executor/pkg.json', './.webpack/pkg.json');

console.log('pkg service');
cp.execSync('pkg service.js --config pkg.json --no-native-build', { cwd: serviceBuildDir });

console.log('pkg service installer');
cp.execSync('pkg service-installer.js --config pkg.json --no-native-build', { cwd: serviceBuildDir });

console.log(`pkg ${DESKTOP_CHANGE_LISTENER_APP_NAME}`);
cp.execSync(
  `pkg desktop-change-listener.js --config pkg.json -o ${DESKTOP_CHANGE_LISTENER_APP_NAME} --no-native-build `,
  {
    cwd: serviceBuildDir,
  }
);

console.log(`pkg ${ACTION_EXECUTOR_APP_NAME}`);
cp.execSync(`pkg action-executor.js --config pkg.json -o ${ACTION_EXECUTOR_APP_NAME} --no-native-build`, { cwd: serviceBuildDir });

console.log('copy files to release folder');
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
fs.copyFileSync(
  path.join(serviceBuildDir, `${DESKTOP_CHANGE_LISTENER_APP_NAME}.exe`),
  path.join(releaseServiceDir, `${DESKTOP_CHANGE_LISTENER_APP_NAME}.exe`)
);
fs.copyFileSync(
  path.join(serviceBuildDir, `${ACTION_EXECUTOR_APP_NAME}.exe`),
  path.join(releaseServiceDir, `${ACTION_EXECUTOR_APP_NAME}.exe`)
);
