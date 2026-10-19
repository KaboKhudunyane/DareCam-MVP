export type DemoRole = 'host' | 'player';

export type DemoProfile = {
  displayName: string;
  city: string;
  role: DemoRole;
  avatar: string;
};

const STORAGE_KEY = 'darecam-demo-profile';

export const DEFAULT_PROFILE: DemoProfile = {
  displayName: 'Kabo',
  city: 'Johannesburg',
  role: 'host',
  avatar: 'K',
};

export function getDemoProfile(): DemoProfile {
  if (typeof window === 'undefined') {
    return DEFAULT_PROFILE;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_PROFILE;
    }

    const parsed = JSON.parse(raw) as Partial<DemoProfile>;

    return {
      displayName: parsed.displayName?.trim() || DEFAULT_PROFILE.displayName,
      city: parsed.city?.trim() || DEFAULT_PROFILE.city,
      role: parsed.role === 'player' ? 'player' : 'host',
      avatar: parsed.avatar?.trim() || DEFAULT_PROFILE.avatar,
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveDemoProfile(profile: DemoProfile) {
  if (typeof window === 'undefined') {
    return;
  }

  const sanitized: DemoProfile = {
    displayName: profile.displayName.trim() || DEFAULT_PROFILE.displayName,
    city: profile.city.trim() || DEFAULT_PROFILE.city,
    role: profile.role === 'player' ? 'player' : 'host',
    avatar: profile.avatar.trim() || DEFAULT_PROFILE.avatar,
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
}
