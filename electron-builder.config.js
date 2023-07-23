const { buildDirectory, productName } = require('./package.json');

module.exports = {
    appId: productName,
    win: {
        target: 'NSIS',
        artifactName: '${productName}-${version}.${ext}',
        icon: 'static/icons/app_icon.ico',
        publisherName: 'Aliaksandr Dzemchyk',
    },
    linux: {
        target: ['tar.gz', 'rpm', 'deb'],
        icon: 'src/assets/app_icon.icns',
    },
    nsis: {
        oneClick: true,
    },
    extraResources: [
        {
            from: 'static',
            to: 'static',
        },
    ],
};
