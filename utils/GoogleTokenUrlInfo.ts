export interface GoogleIdTokenPayload {
  iss: string; // Issuer
  sub: string; // Subject (user ID)
  azp: string; // Authorized party (app's client ID)
  aud: string; // Audience (app's client ID)
  iat: string; // Issued at time (Unix timestamp)
  exp: string; // Expiration time (Unix timestamp)

  // These fields are included when "profile" and "email" scopes are granted.
  email?: string; // User's email address
  email_verified?: string; // Whether email is verified (boolean as string)
  name?: string; // User's full name
  picture?: string; // URL of the user's profile picture
  given_name?: string; // User's given (first) name
  family_name?: string; // User's family (last) name
  locale?: string; // User's locale (language/country code)
}

export async function getGoogleTokenInfoUrl(googleIdToken: string) {
  const res = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${googleIdToken}`
  );
  return res.json();
}
