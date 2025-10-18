/**
 * Electron Environment Detection
 * Utility to check if the app is running in Electron
 */

export const isElectron = (): boolean => {
  // Check if running in Electron environment
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.indexOf(' electron/') > -1;
};

export const isElectronDev = (): boolean => {
  return isElectron() && process.env.NODE_ENV === 'development';
};

export const isElectronProduction = (): boolean => {
  return isElectron() && process.env.NODE_ENV === 'production';
};

// Check if electron API is available
export const hasElectronAPI = (): boolean => {
  return typeof window !== 'undefined' && !!(window as any).electronAPI;
};

// Get electron API if available
export const getElectronAPI = () => {
  if (hasElectronAPI()) {
    return (window as any).electronAPI;
  }
  return null;
};
