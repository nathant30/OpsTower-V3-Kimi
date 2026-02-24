/**
 * Sound Utilities for Notifications
 * Uses Web Audio API for subtle notification sounds
 */

// Sound preferences stored in localStorage
const SOUND_ENABLED_KEY = 'opstower-sound-enabled';

// Audio context for generating sounds
let audioContext: AudioContext | null = null;

/**
 * Get or create audio context
 */
function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch {
      console.warn('Web Audio API not supported');
      return null;
    }
  }
  
  return audioContext;
}

/**
 * Check if sound alerts are enabled
 */
export function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem(SOUND_ENABLED_KEY);
  return stored === null ? true : stored === 'true'; // Default to true
}

/**
 * Toggle sound alerts on/off
 */
export function toggleSound(enabled?: boolean): boolean {
  if (typeof window === 'undefined') return false;
  
  const newValue = enabled !== undefined ? enabled : !isSoundEnabled();
  localStorage.setItem(SOUND_ENABLED_KEY, String(newValue));
  return newValue;
}

/**
 * Play a subtle notification sound
 */
function playTone(frequency: number, duration: number, type: OscillatorType = 'sine'): void {
  const ctx = getAudioContext();
  if (!ctx || !isSoundEnabled()) return;
  
  // Resume context if suspended (browser autoplay policy)
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.frequency.value = frequency;
  oscillator.type = type;
  
  // Fade in and out for a pleasant sound
  const now = ctx.currentTime;
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.1, now + 0.05);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
  
  oscillator.start(now);
  oscillator.stop(now + duration);
}

/**
 * Play success notification sound
 */
export function playSuccessSound(): void {
  playTone(880, 0.3, 'sine'); // A5
  setTimeout(() => playTone(1109, 0.3, 'sine'), 100); // C#6
}

/**
 * Play error notification sound
 */
export function playErrorSound(): void {
  playTone(311, 0.4, 'sawtooth'); // D#4
  setTimeout(() => playTone(277, 0.4, 'sawtooth'), 150); // C#4
}

/**
 * Play warning notification sound
 */
export function playWarningSound(): void {
  playTone(659, 0.3, 'sine'); // E5
  setTimeout(() => playTone(523, 0.3, 'sine'), 100); // C5
}

/**
 * Play info notification sound
 */
export function playInfoSound(): void {
  playTone(523, 0.2, 'sine'); // C5
}

/**
 * Play critical alert sound (for important events)
 */
export function playCriticalSound(): void {
  playTone(440, 0.2, 'sine'); // A4
  setTimeout(() => playTone(554, 0.2, 'sine'), 100); // C#5
  setTimeout(() => playTone(659, 0.3, 'sine'), 200); // E5
}

/**
 * Play sound based on notification type
 */
export function playNotificationSound(type: 'success' | 'error' | 'warning' | 'info' | 'critical'): void {
  switch (type) {
    case 'success':
      playSuccessSound();
      break;
    case 'error':
      playErrorSound();
      break;
    case 'warning':
      playWarningSound();
      break;
    case 'info':
      playInfoSound();
      break;
    case 'critical':
      playCriticalSound();
      break;
  }
}

/**
 * Initialize audio context on user interaction
 * Call this in response to a click event to enable audio
 */
export function initAudio(): void {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
}
