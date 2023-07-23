import { APP_NAME } from '../constants';
import { Service } from 'node-windows';
import path from 'path';

// Create a new service object
const svc = new Service({
    name: APP_NAME.replace(/ /g, '_') + '_service',
    script: path.join(__dirname, 'service.js'),
});

// Listen for the "uninstall" event so we know when it's done.
svc.on('install', function () {
    console.log('Install complete.');
    console.log('The service exists: ', svc.exists);
    svc.start();
});

svc.on('uninstall', () => {
    svc.install();
});

if (svc.exists) {
    svc.uninstall();
} else {
    svc.install();
}
