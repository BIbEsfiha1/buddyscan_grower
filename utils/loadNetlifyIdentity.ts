let netlifyIdentityPromise: Promise<typeof import('netlify-identity-widget').default> | null = null;

export async function loadNetlifyIdentity() {
  if (!netlifyIdentityPromise) {
    netlifyIdentityPromise = import('netlify-identity-widget').then((mod) => {
      const netlifyIdentity = mod.default;
      if (!(window as any).__netlifyIdentityInitialized) {
        netlifyIdentity.init({
          APIUrl: 'https://buddyscan-app.windsurf.build/.netlify/identity'
        });
        (window as any).__netlifyIdentityInitialized = true;
      }
      return netlifyIdentity;
    });
  }
  return netlifyIdentityPromise;
}
