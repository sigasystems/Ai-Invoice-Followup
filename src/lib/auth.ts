export const login = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('isLoggedIn', 'true');
    window.dispatchEvent(new Event('auth-change'));
  }
};

export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('isLoggedIn');
    window.dispatchEvent(new Event('auth-change'));
    window.location.href = '/auth/login';
  }
};

export const isAuthenticated = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('isLoggedIn') === 'true';
  }
  return false;
};
