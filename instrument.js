// Import with `import * as Sentry from "@sentry/node"` if you are using ESM
const Sentry = require("@sentry/node");
const { nodeProfilingIntegration } = require("@sentry/profiling-node");

Sentry.init({
  dsn: "https://16634e150d5cb2ec95992f8458b41cfb@o4509039188967424.ingest.de.sentry.io/4509045887205456",
  integrations: [
    nodeProfilingIntegration(),
  ],
  // Tracing
  tracesSampleRate: 1.0, //  Capture 100% of the transactions

  // Set sampling rate for profiling - this is evaluated only once per SDK.init
  profileSessionSampleRate: 1.0,
});


// // Starts a transaction that will also be profiled
// Sentry.startSpan({
//   name: "My First Transaction",
// }, () => {
//   // the code executing inside the transaction will be wrapped in a span and profiled
// });

// // Calls to stopProfiler are optional - if you don't stop the profile session, it will keep profiling
// // your application until the process exits or stopProfiler is called.
// Sentry.profiler.stopProfiler();