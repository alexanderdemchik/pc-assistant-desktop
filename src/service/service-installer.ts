import fs from 'fs';
import path from 'path';
import { version } from './version.json';
import cp from 'child_process';

enum ARGS {
  INSTALL = 'install',
  UNINSTALL = 'uninstall',
}

const arg: string = process.argv[2];

const SERVICE_FOLDER = 'Voice_PC_Assistant_Service';
const SERVICE_FOLDER_PATH = path.join(process.env.PROGRAMDATA, SERVICE_FOLDER);
const SERVICE_EXE = 'voice_pc_assistant_service.exe';
const SERVICE_XML = 'voice_pc_assistant_service.xml';
const SERVICE_INSTALLER_EXE_FOLDER = path.join(process.argv[0], '..');

switch (arg) {
  case ARGS.INSTALL:
    if (fs.existsSync(SERVICE_FOLDER_PATH)) {
      let shouldUpdateService = false;
      try {
        const { version: oldVersion } = JSON.parse(
          fs.readFileSync(path.join(SERVICE_FOLDER_PATH, 'version.json')).toString()
        );

        if (oldVersion !== version) {
          shouldUpdateService = true;
        }
      } catch (e) {
        shouldUpdateService = true;
      }

      if (shouldUpdateService) {
        cp.execSync(`${SERVICE_EXE} stop && ${SERVICE_EXE} uninstall`, { cwd: SERVICE_FOLDER_PATH });
        fs.rmSync(SERVICE_FOLDER_PATH, { force: true, recursive: true });
      } else {
        break;
      }
    }

    fs.mkdirSync(SERVICE_FOLDER_PATH);

    fs.copyFileSync(path.join(SERVICE_INSTALLER_EXE_FOLDER, SERVICE_EXE), path.join(SERVICE_FOLDER_PATH, SERVICE_EXE));
    fs.copyFileSync(
      path.join(SERVICE_INSTALLER_EXE_FOLDER, 'service.exe'),
      path.join(SERVICE_FOLDER_PATH, 'service.exe')
    );
    fs.copyFileSync(path.join(SERVICE_INSTALLER_EXE_FOLDER, SERVICE_XML), path.join(SERVICE_FOLDER_PATH, SERVICE_XML));
    fs.copyFileSync(
      path.join(SERVICE_INSTALLER_EXE_FOLDER, 'version.json'),
      path.join(SERVICE_FOLDER_PATH, 'version.json')
    );

    cp.execSync(`${SERVICE_EXE} install && ${SERVICE_EXE} start`, { cwd: SERVICE_FOLDER_PATH });
    break;
  case ARGS.UNINSTALL:
    cp.execSync(`${SERVICE_EXE} stop && ${SERVICE_EXE} uninstall`, { cwd: SERVICE_FOLDER_PATH });
    fs.rmSync(SERVICE_FOLDER_PATH, { force: true, recursive: true });
    break;
}
