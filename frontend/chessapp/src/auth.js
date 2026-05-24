const TOKEN_KEY = "chessapp_jwt_token";
const HEALTH_PROFILE_PREFIX = "chessapp_health_profile_";

const createJwt = (email) => {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    email,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    iat: Math.floor(Date.now() / 1000),
  };

  const toBase64 = (value) => {
    return btoa(JSON.stringify(value))
      .replace(/=+$/, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  };

  return `${toBase64(header)}.${toBase64(payload)}.signature`;
};

const decodeJwt = (token) => {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const rawPayload = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const json = atob(rawPayload);
    return JSON.parse(json);
  } catch {
    return null;
  }
};

const storeAuth = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
};

const getProfileKey = (email) => {
  return `${HEALTH_PROFILE_PREFIX}${email.toLowerCase()}`;
};

const getUserHealthProfile = (email) => {
  if (!email) {
    return null;
  }

  try {
    const rawProfile = localStorage.getItem(getProfileKey(email));
    if (!rawProfile) {
      return null;
    }

    return JSON.parse(rawProfile);
  } catch {
    return null;
  }
};

const saveUserHealthProfile = (email, profile) => {
  localStorage.setItem(getProfileKey(email), JSON.stringify(profile));
};

const getStoredAuth = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  const payload = decodeJwt(token);

  if (!payload || !payload.email || payload.exp < Math.floor(Date.now() / 1000)) {
    clearAuth();
    return null;
  }

  return {
    token,
    email: payload.email,
  };
};

export {
  createJwt,
  decodeJwt,
  storeAuth,
  clearAuth,
  getStoredAuth,
  getUserHealthProfile,
  saveUserHealthProfile,
};
