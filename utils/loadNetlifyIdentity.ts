import netlifyIdentity from 'netlify-identity-widget';

let identityInstance: typeof netlifyIdentity | null = null;

export function loadNetlifyIdentity() {
  if (!identityInstance) {
    // Inicializa o widget apenas uma vez no ambiente de browser
    if (typeof window !== 'undefined' && !(window as any).__netlifyIdentityInitialized) {
      netlifyIdentity.init();
      (window as any).__netlifyIdentityInitialized = true;
    }
    // Também inicializa em ambientes não-browser, caso necessário
    else if (typeof window === 'undefined') {
      netlifyIdentity.init();
    }

    identityInstance = netlifyIdentity;
  }

  return identityInstance;
}

export default loadNetlifyIdentity;
