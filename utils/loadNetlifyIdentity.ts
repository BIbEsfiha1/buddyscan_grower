import netlifyIdentity from 'netlify-identity-widget';

let identityInstance: typeof netlifyIdentity | null = null;

export function loadNetlifyIdentity() {
  if (!identityInstance) {
    if (typeof window !== 'undefined' && !(window as any).__netlifyIdentityInitialized) {
      netlifyIdentity.init();
      (window as any).__netlifyIdentityInitialized = true;
    } else if (typeof window === 'undefined') {
      // In non-browser environments just init once
      netlifyIdentity.init();
    }
    identityInstance = netlifyIdentity;
  }

  return identityInstance;
}

export default loadNetlifyIdentity;
