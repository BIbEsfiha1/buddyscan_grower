declare module 'netlify-identity-widget' {
  interface User {
    app_metadata: { [key: string]: any };
    aud: string;
    confirmed_at: string;
    created_at: string;
    email: string;
    id: string;
    invited_at?: string;
    is_anonymous: boolean;
    recovery_token?: string;
    role: string;
    updated_at: string;
    url: string;
    user_metadata: { [key: string]: any };
    token?: {
      access_token: string;
      expires_at: number;
      expires_in: number;
      refresh_token: string;
      token_type: string;
    };
    api: {
      _sameOrigin?: boolean;
      defaultHeaders: { [key: string]: string };
      apiURL: string;
    };
    // Add other properties and methods as needed from the library's documentation or usage
    update(attributes: any): Promise<User>;
    // ... any other methods you use
  }

  interface NetlifyIdentity {
    currentUser(): User | null;
    init(options?: any): void;
    open(tabName?: 'login' | 'signup' | 'recover'): void;
    logout(): Promise<void>;
    on(event: 'init' | 'login' | 'logout' | 'error' | 'open' | 'close', callback: (userOrError?: User | Error) => void): void;
    off(event: 'init' | 'login' | 'logout' | 'error' | 'open' | 'close', callback: (userOrError?: User | Error) => void): void;
    close(): void;
    // Add other methods and properties as needed
    refresh(force?: boolean): Promise<string | null>;
    settings: any;
    gotrue: any; // This is the GoTrueJS instance
  }

  const netlifyIdentity: NetlifyIdentity;
  export default netlifyIdentity;
  export type { User }; // Export User type if you need to use it directly
}
