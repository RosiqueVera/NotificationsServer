import * as admin from 'firebase-admin';

import corpo8 from '../keys/corpo-8-firebase-adminsdk-3idy4-67e87f7f17.json';
import pushDemo from '../keys/flutterpushnotifications-bfb3e-firebase-adminsdk-3txzv-2231a3d56d.json';

const corpo8App = admin.initializeApp(
    {
        credential: admin.credential.cert(corpo8)
    },
    'corpo8'
);

const pushDemoApp = admin.initializeApp(
    {
        credential: admin.credential.cert(pushDemo)
    },
  
    'pushDemo'
);

module.exports = {corpo8App, pushDemoApp};