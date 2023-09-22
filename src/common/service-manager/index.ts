import { ServiceManager } from './ServiceManager';
import { WinServiceManager } from './WinServiceManager';

let manager: ServiceManager;

if (process.platform === 'win32') {
  manager = new WinServiceManager();
}

export default manager;
