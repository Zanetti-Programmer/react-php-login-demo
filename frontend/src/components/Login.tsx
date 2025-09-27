import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { GoogleIdentityConfig, CredentialResponse, PromptMomentNotification, GoogleSignInButtonConfig } from '../types/google';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [googleInitialized, setGoogleInitialized] = useState(false);
  const [oneTapFailed, setOneTapFailed] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  
  const { login, register, googleLogin, loading, error, clearError } = useAuth();

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

  // Initialize Google OAuth on component mount
  useEffect(() => {
    initializeGoogleOAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeGoogleOAuth = async () => {
    // Wait for Google Identity Services to load
    let retries = 0;
    const maxRetries = 10;
    
    const waitForGoogle = () => {
      return new Promise<void>((resolve, reject) => {
        const checkGoogle = () => {
          if (window.google?.accounts?.id) {
            resolve();
          } else if (retries < maxRetries) {
            retries++;
            setTimeout(checkGoogle, 500);
          } else {
            reject(new Error('Google Identity Services failed to load'));
          }
        };
        checkGoogle();
      });
    };

    try {
      await waitForGoogle();
      
      const config: GoogleIdentityConfig = {
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'your-google-client-id',
        callback: handleGoogleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
        context: isLogin ? 'signin' : 'signup',
        // FedCM compatibility
        use_fedcm_for_prompt: true,
      };

      window.google!.accounts.id.initialize(config);
      setGoogleInitialized(true);
      
      // Try One Tap first, but don't rely on it
      attemptOneTap();
      
      // Always render the manual button
      renderManualButton();
      
    } catch (error) {
      console.warn('Google OAuth initialization failed:', error);
      setGoogleError('Google Sign-In is temporarily unavailable');
    }
  };

  const attemptOneTap = () => {
    if (!window.google?.accounts?.id) return;

    try {
      window.google.accounts.id.prompt((notification: PromptMomentNotification) => {
        if (notification.isNotDisplayed()) {
          const reason = notification.getNotDisplayedReason();
          console.info('One Tap not displayed:', reason);
          
          switch (reason) {
            case 'opt_out_or_no_session':
              setOneTapFailed(true);
              // This is expected - user hasn't opted in or no session
              break;
            case 'browser_not_supported':
            case 'invalid_client':
            case 'missing_client_id':
            case 'secure_http_required':
            case 'unregistered_origin':
              setGoogleError(`Google Sign-In configuration issue: ${reason}`);
              break;
            case 'suppressed_by_user':
              setOneTapFailed(true);
              // User actively dismissed One Tap
              break;
            default:
              setOneTapFailed(true);
          }
        }
        
        if (notification.isSkippedMoment()) {
          const reason = notification.getSkippedReason();
          console.info('One Tap skipped:', reason);
          setOneTapFailed(true);
        }
      });
    } catch (error) {
      console.warn('One Tap prompt failed:', error);
      setOneTapFailed(true);
    }
  };

  const renderManualButton = () => {
    if (!window.google?.accounts?.id || !googleButtonRef.current) return;

    // Clear any existing button
    googleButtonRef.current.innerHTML = '';

    const buttonConfig: GoogleSignInButtonConfig = {
      type: 'standard',
      size: 'large',
      theme: 'outline',
      text: isLogin ? 'signin_with' : 'signup_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width: '100%',
    };

    try {
      window.google.accounts.id.renderButton(googleButtonRef.current, buttonConfig);
    } catch (error) {
      console.error('Failed to render Google button:', error);
      setGoogleError('Failed to load Google Sign-In button');
    }
  };

  const handleGoogleCredentialResponse = async (response: CredentialResponse) => {
    try {
      setGoogleError(null);
      
      // Decode the JWT token to get user info
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      console.info('Google login successful via:', response.select_by);
      
      await googleLogin(response.credential, payload.name, payload.email);
    } catch (error) {
      console.error('Google login error:', error);
      setGoogleError('Google login failed. Please try again.');
    }
  };

  // Re-render button when mode changes
  useEffect(() => {
    if (googleInitialized) {
      renderManualButton();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLogin, googleInitialized]);

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    clearError();
    setGoogleError(null);
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

        {googleError && (
          <div className="message error">
            {googleError}
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

          {/* Google Sign-In Section */}
          <div className="google-signin-section">
            <div className="divider">
              <span>or</span>
            </div>
            
            {googleInitialized ? (
              <div className="google-signin-container">
                {oneTapFailed && !googleError && (
                  <p className="google-info">
                    Use the Google Sign-In button below:
                  </p>
                )}
                <div 
                  ref={googleButtonRef} 
                  className="google-button-container"
                  style={{ width: '100%' }}
                />
              </div>
            ) : (
              <div className="google-loading">
                <div className="spinner" style={{ width: '20px', height: '20px', margin: '10px auto' }}></div>
                <p>Loading Google Sign-In...</p>
              </div>
            )}
          </div>
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