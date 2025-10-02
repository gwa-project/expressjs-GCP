import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';

/**
 * Get Google OAuth2 Client
 */
export function getGoogleOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set');
  }

  return new OAuth2Client(clientId, clientSecret);
}

/**
 * Verify Google ID Token
 * @param {string} idToken - Google ID token from client
 * @returns {Object} User info from token
 */
export async function verifyGoogleToken(idToken) {
  try {
    const client = getGoogleOAuthClient();
    const clientId = process.env.GOOGLE_CLIENT_ID;

    const ticket = await client.verifyIdToken({
      idToken,
      audience: clientId
    });

    const payload = ticket.getPayload();

    return {
      googleId: payload.sub,
      email: payload.email,
      emailVerified: payload.email_verified,
      name: payload.name,
      picture: payload.picture,
      givenName: payload.given_name,
      familyName: payload.family_name
    };
  } catch (err) {
    throw new Error(`Google token verification failed: ${err.message}`);
  }
}

/**
 * Exchange authorization code for tokens
 * @param {string} code - Authorization code from Google
 * @param {string} redirectUri - Redirect URI used in the auth request
 */
export async function exchangeCodeForTokens(code, redirectUri) {
  const client = getGoogleOAuthClient();

  try {
    const { tokens } = await client.getToken({
      code,
      redirect_uri: redirectUri
    });

    return tokens;
  } catch (err) {
    throw new Error(`Failed to exchange code for tokens: ${err.message}`);
  }
}

/**
 * Get user info from Google using access token
 * @param {string} accessToken - Google access token
 */
export async function getUserInfoFromGoogle(accessToken) {
  try {
    const response = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    return {
      googleId: response.data.id,
      email: response.data.email,
      emailVerified: response.data.verified_email,
      name: response.data.name,
      picture: response.data.picture,
      givenName: response.data.given_name,
      familyName: response.data.family_name
    };
  } catch (err) {
    throw new Error(`Failed to get user info from Google: ${err.message}`);
  }
}

/**
 * Generate Google OAuth URL for authentication
 * @param {string} redirectUri - Where to redirect after auth
 * @param {string} state - CSRF protection state
 */
export function getGoogleAuthUrl(redirectUri, state = '') {
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    throw new Error('GOOGLE_CLIENT_ID must be set');
  }

  const scopes = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ];

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes.join(' '),
    access_type: 'offline',
    prompt: 'consent'
  });

  if (state) {
    params.append('state', state);
  }

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}
