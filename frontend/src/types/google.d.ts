// Google Identity Services API Type Definitions
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          // Core initialization and configuration
          initialize: (config: GoogleIdentityConfig) => void;
          
          // One Tap functionality
          prompt: (momentListener?: (notification: PromptMomentNotification) => void) => void;
          
          // Manual button rendering
          renderButton: (
            parent: HTMLElement, 
            options: GoogleSignInButtonConfig
          ) => void;
          
          // Revoke authorization
          revoke: (email: string, callback: (response: RevokeResponse) => void) => void;
          
          // Cancel the One Tap flow
          cancel: () => void;
          
          // FedCM methods for future compatibility
          store: (credential: string) => void;
        };
      };
    };
  }
}

// Google Identity Services Configuration
export interface GoogleIdentityConfig {
  client_id: string;
  callback: (response: CredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
  context?: 'signin' | 'signup' | 'use';
  prompt_parent_id?: string;
  nonce?: string;
  
  // FedCM compatibility options
  use_fedcm_for_prompt?: boolean;
  
  // UI customization
  logo_alignment?: 'left' | 'center';
  hosted_domain?: string;
  
  // Advanced options
  allowed_parent_origin?: string[];
  intermediate_iframe_close_callback?: () => void;
}

// Credential Response from Google
export interface CredentialResponse {
  credential: string; // JWT token
  select_by?: 'auto' | 'user' | 'user_1tap' | 'user_2tap' | 'btn' | 'btn_confirm' | 'btn_add_session' | 'btn_confirm_add_session';
}

// Button Configuration
export interface GoogleSignInButtonConfig {
  type?: 'standard' | 'icon';
  size?: 'large' | 'medium' | 'small';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  logo_alignment?: 'left' | 'center';
  width?: string | number;
  locale?: string;
  click_listener?: () => void;
}

// Prompt Moment Notification
export interface PromptMomentNotification {
  isDisplayMoment: () => boolean;
  isDisplayed: () => boolean;
  isNotDisplayed: () => boolean;
  getNotDisplayedReason: () => 'browser_not_supported' | 'invalid_client' | 'missing_client_id' | 'opt_out_or_no_session' | 'secure_http_required' | 'suppressed_by_user' | 'unregistered_origin' | 'unknown_reason';
  isSkippedMoment: () => boolean;
  getSkippedReason: () => 'auto_cancel' | 'user_cancel' | 'tap_outside' | 'issuing_failed';
  isDismissedMoment: () => boolean;
  getDismissedReason: () => 'credential_returned' | 'cancel_called' | 'flow_restarted';
  getMomentType: () => 'display' | 'skipped' | 'dismissed';
}

// Revoke Response
export interface RevokeResponse {
  successful: boolean;
  error?: string;
}

export {};