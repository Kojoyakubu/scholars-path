const CALLBACK_PATH = '/auth/social/callback';
const STORAGE_KEY_PREFIX = 'social_oauth_state_';

const randomString = (length = 64) => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let value = '';
  const randomValues = new Uint8Array(length);
  window.crypto.getRandomValues(randomValues);

  for (let i = 0; i < length; i += 1) {
    value += charset[randomValues[i] % charset.length];
  }

  return value;
};

const toBase64Url = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let str = '';
  for (let i = 0; i < bytes.byteLength; i += 1) {
    str += String.fromCharCode(bytes[i]);
  }

  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
};

const createCodeChallenge = async (verifier) => {
  const data = new TextEncoder().encode(verifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return toBase64Url(digest);
};

const getBaseRedirectUri = () => {
  const configured = import.meta.env.VITE_APP_URL;
  return configured || window.location.origin;
};

const getSocialOAuthConfig = (provider) => {
  const redirectUri = `${getBaseRedirectUri()}${CALLBACK_PATH}`;

  const configs = {
    facebook: {
      clientId: import.meta.env.VITE_FACEBOOK_CLIENT_ID,
      authUrl: 'https://www.facebook.com/v19.0/dialog/oauth',
      scopes: 'email,public_profile',
      responseType: 'code',
    },
    github: {
      clientId: import.meta.env.VITE_GITHUB_CLIENT_ID,
      authUrl: 'https://github.com/login/oauth/authorize',
      scopes: 'read:user user:email',
      responseType: 'code',
    },
    linkedin: {
      clientId: import.meta.env.VITE_LINKEDIN_CLIENT_ID,
      authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
      scopes: 'openid profile email',
      responseType: 'code',
    },
    tiktok: {
      clientId: import.meta.env.VITE_TIKTOK_CLIENT_KEY,
      authUrl: 'https://www.tiktok.com/v2/auth/authorize/',
      scopes: 'user.info.basic',
      responseType: 'code',
      clientKeyParam: true,
      forceRedirectParam: true,
    },
    x: {
      clientId: import.meta.env.VITE_X_CLIENT_ID,
      authUrl: 'https://twitter.com/i/oauth2/authorize',
      scopes: 'users.read offline.access',
      responseType: 'code',
      pkce: true,
    },
  };

  const config = configs[provider];
  if (!config) {
    return null;
  }

  return {
    ...config,
    redirectUri,
  };
};

export const startSocialOAuth = async ({ provider, mode, role }) => {
  const config = getSocialOAuthConfig(provider);
  if (!config) {
    return { ok: false, message: `Unsupported provider: ${provider}` };
  }

  if (!config.clientId) {
    return {
      ok: false,
      message: `${provider.toUpperCase()} OAuth is not configured. Missing client ID in frontend env.`,
    };
  }

  const state = randomString(24);
  const params = new URLSearchParams();

  if (config.clientKeyParam) {
    params.set('client_key', config.clientId);
  } else {
    params.set('client_id', config.clientId);
  }

  params.set('redirect_uri', config.redirectUri);
  params.set('response_type', config.responseType);
  params.set('scope', config.scopes);
  params.set('state', state);

  let codeVerifier;
  if (config.pkce) {
    codeVerifier = randomString(96);
    const challenge = await createCodeChallenge(codeVerifier);
    params.set('code_challenge', challenge);
    params.set('code_challenge_method', 'S256');
  }

  if (config.forceRedirectParam) {
    params.set('force_web_auth', '1');
  }

  sessionStorage.setItem(
    `${STORAGE_KEY_PREFIX}${state}`,
    JSON.stringify({ provider, mode, role, codeVerifier, redirectUri: config.redirectUri })
  );

  window.location.assign(`${config.authUrl}?${params.toString()}`);
  return { ok: true };
};

export const consumeSocialOAuthState = (state) => {
  if (!state) {
    return null;
  }

  const key = `${STORAGE_KEY_PREFIX}${state}`;
  const raw = sessionStorage.getItem(key);
  sessionStorage.removeItem(key);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
};
