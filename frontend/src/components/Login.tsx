import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [googleInitialized, setGoogleInitialized] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const { login, register, googleLogin, loading, error, clearError } = useAuth();

  const handleGoogleCallback = useCallback((response: any) => {
    (async () => {
      try {
        // Decode the JWT token to get user info
        const payload = JSON.parse(atob(response.credential.split('.')[1]));
        await googleLogin(response.credential, payload.name, payload.email);
      } catch (error) {
        console.error('Google login error:', error);
      }
    })();
  }, [googleLogin]);

  useEffect(() => {
    // Initialize Google Sign-In when component mounts
    const initializeGoogle = () => {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'your-google-client-id',
            callback: handleGoogleCallback,
          });
          setGoogleInitialized(true);
          console.log('Google Sign-In initialized successfully');
        } catch (error) {
          console.error('Error initializing Google Sign-In:', error);
        }
      } else {
        // Check if the script is blocked or not loaded
        if (document.querySelector('script[src*="accounts.google.com"]')) {
          console.warn('Google Sign-In script is loaded but API not available. This could be due to ad blockers or privacy extensions.');
        } else {
          console.warn('Google Sign-In script not found in DOM');
        }
        
        // Retry after a short delay if Google API is not loaded yet
        const retryCount = parseInt(sessionStorage.getItem('google-init-retry') || '0');
        if (retryCount < 10) {
          sessionStorage.setItem('google-init-retry', (retryCount + 1).toString());
          setTimeout(initializeGoogle, 500);
        } else {
          console.error('Failed to initialize Google Sign-In after multiple attempts. Please check if ad blockers or privacy extensions are blocking Google services.');
        }
      }
    };

    // Clear retry count on successful page load
    sessionStorage.removeItem('google-init-retry');
    initializeGoogle();
  }, [handleGoogleCallback]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLogin && formData.password !== formData.confirmPassword) {
      return;
    }

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.name, formData.email, formData.password);
      }
    } catch (error) {
      // Error is handled by context
    }
  };

  const handleGoogleLogin = async () => {
    try {
      if (googleInitialized && window.google && window.google.accounts) {
        // Use the pre-initialized Google Sign-In
        console.log('Attempting to show Google Sign-In prompt');
        window.google.accounts.id.prompt();
      } else {
        console.warn('Google Sign-In not available. This might be due to:');
        console.warn('1. Ad blockers blocking Google services');
        console.warn('2. Privacy extensions blocking tracking scripts');
        console.warn('3. Network connectivity issues');
        console.warn('4. Browser privacy settings');
        console.warn('Using fallback mock login for demonstration...');
        
        // Fallback to mock data for demonstration
        const mockGoogleData = {
          token: 'mock-google-token',
          name: 'Demo User',
          email: 'demo@google.com'
        };
        await googleLogin(mockGoogleData.token, mockGoogleData.name, mockGoogleData.email);
      }
    } catch (error) {
      console.error('Error initiating Google login:', error);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    clearError();
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
          <p>{isLogin ? 'Sign in to your account' : 'Join us today'}</p>
        </div>

        {error && (
          <div className="message error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label" htmlFor="name">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-input"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleInputChange}
                required={!isLogin}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className="form-input"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required={!isLogin}
              />
              {formData.password !== formData.confirmPassword && formData.confirmPassword && (
                <small style={{ color: '#ff6b6b', fontSize: '0.8rem', marginTop: '5px', display: 'block' }}>
                  Passwords do not match
                </small>
              )}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || (!isLogin && formData.password !== formData.confirmPassword)}
          >
            {loading ? (
              <div className="spinner" style={{ width: '20px', height: '20px', margin: '0 auto' }}></div>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>

          <button
            type="button"
            className="btn btn-google"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <svg className="google-icon" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </form>

        <div className="form-toggle">
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </p>
          <button type="button" onClick={toggleMode}>
            {isLogin ? 'Create Account' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;