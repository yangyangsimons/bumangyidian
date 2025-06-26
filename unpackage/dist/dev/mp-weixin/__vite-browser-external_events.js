"use strict";
new Proxy({}, {
  get(_, key) {
    throw new Error(`Module "events" has been externalized for browser compatibility. Cannot access "events.${key}" in client code.  See https://vitejs.dev/guide/troubleshooting.html#module-externalized-for-browser-compatibility for more details.`);
  }
});
//# sourceMappingURL=../.sourcemap/mp-weixin/__vite-browser-external_events.js.map
