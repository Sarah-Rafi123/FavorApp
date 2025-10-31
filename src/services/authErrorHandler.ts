class AuthErrorHandler {
  private listeners: Array<(error: any) => void> = [];

  // Emit authentication error event
  emitAuthError(error: any) {
    console.log('🚨 Authentication error detected, notifying listeners');
    this.listeners.forEach(listener => {
      try {
        listener(error);
      } catch (err) {
        console.error('Error in auth error listener:', err);
      }
    });
  }

  // Listen for authentication errors
  onAuthError(callback: (error: any) => void) {
    this.listeners.push(callback);
  }

  // Remove authentication error listener
  removeAuthErrorListener(callback: (error: any) => void) {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }
}

// Export singleton instance
export const authErrorHandler = new AuthErrorHandler();