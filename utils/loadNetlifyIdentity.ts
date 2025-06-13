import netlifyIdentity from 'netlify-identity-widget';

let identityInstance: typeof netlifyIdentity | null = null;

export function loadNetlifyIdentity() {
  if (!identityInstance) {
    // A inicialização já ocorre no AuthProvider. Apenas forneça a instância
    // única para outros módulos quando solicitado.
    identityInstance = netlifyIdentity;
  }

  return identityInstance;
}

export default loadNetlifyIdentity;
