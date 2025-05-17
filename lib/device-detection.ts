'use client';

/**
 * Detects if the current device is running iOS
 * @returns boolean indicating if the device is iOS
 */
export function isIOS(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
}

/**
 * Detects if the current device is running Safari
 * @returns boolean indicating if the browser is Safari
 */
export function isSafari(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  return userAgent.indexOf('safari') > -1 && userAgent.indexOf('chrome') === -1;
}

/**
 * Detects if the current device is running iOS Safari
 * @returns boolean indicating if the device is iOS Safari
 */
export function isIOSSafari(): boolean {
  return isIOS() && isSafari();
}

/**
 * Gets the iOS version if applicable
 * @returns string with iOS version or null
 */
export function getIOSVersion(): string | null {
  if (!isIOS()) {
    return null;
  }
  
  const userAgent = window.navigator.userAgent;
  const match = userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/);
  
  return match ? `${match[1]}.${match[2]}${match[3] ? `.${match[3]}` : ''}` : null;
}
