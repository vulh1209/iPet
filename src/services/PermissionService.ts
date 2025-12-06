/**
 * macOS Permission Service
 * Wrapper around tauri-plugin-macos-permissions for checking and requesting
 * system permissions (microphone, etc.)
 *
 * Uses dynamic imports to avoid crashes in non-Tauri environments
 */

export type PermissionStatus = 'authorized' | 'denied' | 'not-determined' | 'error';

export interface PermissionResult {
  status: PermissionStatus;
  error?: string;
}

/**
 * Check if we're running in Tauri environment
 */
function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI__' in window;
}

/**
 * Check microphone permission status
 */
export async function checkMicPermission(): Promise<PermissionResult> {
  // Skip permission check in dev mode - plugin may cause crashes
  if (import.meta.env.DEV) {
    return { status: 'authorized' };
  }

  if (!isTauri()) {
    // In browser, assume authorized (browser handles its own permissions)
    return { status: 'authorized' };
  }

  try {
    // Dynamic import to avoid crash when not in Tauri
    const module = await import('tauri-plugin-macos-permissions-api');
    const authorized = await module.checkMicrophonePermission();
    return {
      status: authorized ? 'authorized' : 'denied',
    };
  } catch (error) {
    console.error('[PermissionService] Failed to check microphone permission:', error);
    return {
      status: 'error',
      error: String(error),
    };
  }
}

/**
 * Request microphone permission
 * Returns true if permission was granted
 */
export async function requestMicPermission(): Promise<PermissionResult> {
  // Skip permission request in dev mode - plugin may cause crashes
  if (import.meta.env.DEV) {
    return { status: 'authorized' };
  }

  if (!isTauri()) {
    // In browser, try to request via getUserMedia
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop all tracks immediately - we just needed the permission prompt
      stream.getTracks().forEach(track => track.stop());
      return { status: 'authorized' };
    } catch (error) {
      console.error('[PermissionService] Browser microphone permission denied:', error);
      return {
        status: 'denied',
        error: 'Microphone permission denied',
      };
    }
  }

  try {
    // Dynamic import to avoid crash when not in Tauri
    const module = await import('tauri-plugin-macos-permissions-api');
    const granted = await module.requestMicrophonePermission();
    return {
      status: granted ? 'authorized' : 'denied',
    };
  } catch (error) {
    console.error('[PermissionService] Failed to request microphone permission:', error);
    return {
      status: 'error',
      error: String(error),
    };
  }
}

/**
 * Ensure microphone permission is granted
 * Checks first, then requests if not authorized
 */
export async function ensureMicPermission(): Promise<PermissionResult> {
  const checkResult = await checkMicPermission();

  if (checkResult.status === 'authorized') {
    return checkResult;
  }

  // If not authorized, try to request
  if (checkResult.status === 'denied' || checkResult.status === 'not-determined') {
    return await requestMicPermission();
  }

  return checkResult;
}

export const PermissionService = {
  checkMicPermission,
  requestMicPermission,
  ensureMicPermission,
  isTauri,
};

export default PermissionService;
