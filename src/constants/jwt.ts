const BASE_COOKIE_SETTINGS = {
  secure: true,
  httpOnly: true,
  sameSite: 'strict' as const,
  path: '/'
};

export const COOKIE_SETTINGS = {
  ...BASE_COOKIE_SETTINGS,
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

export const CLEAR_COOKIE_SETTINGS = {
  ...BASE_COOKIE_SETTINGS,
  maxAge: 0
};
