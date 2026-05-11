export const login = (email?: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('isLoggedIn', 'true');
    if (email) localStorage.setItem('userEmail', email);
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
