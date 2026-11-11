// The CSP requires Trusted Types for every script sink. The app writes no HTML strings; the only sink it reaches
// is script.src, set by Vercel Analytics and Speed Insights. The default policy admits those URLs and rejects the rest.
const ALLOWED_SCRIPT_URL = /^(\/_vercel\/|https:\/\/va\.vercel-scripts\.com\/)/;

interface TrustedTypesFactory {
  createPolicy: (name: string, rules: { createScriptURL: (url: string) => string }) => unknown;
}

export function isAllowedScriptUrl(url: string): boolean {
  return ALLOWED_SCRIPT_URL.test(url);
}

export function installTrustedTypesPolicy(): void {
  const factory = (globalThis as { trustedTypes?: TrustedTypesFactory }).trustedTypes;
  if (!factory) return;
  try {
    factory.createPolicy('default', {
      createScriptURL: (url) => {
        if (isAllowedScriptUrl(url)) return url;
        throw new TypeError(`Blocked script URL: ${url}`);
      },
    });
  } catch {
    // A second call (hot reload) finds the policy already created.
  }
}
