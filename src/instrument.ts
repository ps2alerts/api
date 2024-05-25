// Import with `const Sentry = require("@sentry/node");` if you are using CJS
import * as Sentry from '@sentry/node';
import {nodeProfilingIntegration} from '@sentry/profiling-node';

Sentry.init({
    dsn: 'https://09b6521e230a7a987e3ca046f774760c@o4507319323262976.ingest.de.sentry.io/4507319628922960',
    environment: process.env.NODE_ENV,
    release: process.env.VERSION,
    integrations: [
        nodeProfilingIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0, //  Capture 100% of the transactions

    // Set sampling rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate: 1.0,
});
