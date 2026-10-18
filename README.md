export type DemoRole = 'host' | 'player';

export type DemoProfile = {
  displayName: string;
  city: string;
  role: DemoRole;
  avatar: string;
};

export const DEFAULT_PROFILE: DemoProfile = {
  displayName: 'Kabo',
  city: 'Johannesburg',
  role: 'host',
  avatar: 'K',
};

const STORAGE_KEY = 'darecam-demo-profile';

export function getDemoProfile(): DemoProfile {
  if (typeof window === 'undefined') {
    return DEFAULT_PROFILE;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return DEFAULT_PROFILE;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<DemoProfile>;
    return {
      displayName: parsed.displayName?.trim() || DEFAULT_PROFILE.displayName,
      city: parsed.city?.trim() || DEFAULT_PROFILE.city,
      role: parsed.role === 'player' ? 'player' : 'host',
      avatar: (parsed.displayName || DEFAULT_PROFILE.displayName).trim().charAt(0).toUpperCase() || DEFAULT_PROFILE.avatar,
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveDemoProfile(profile: DemoProfile) {
  if (typeof window === 'undefined') {
    return;
  }

  const normalized: DemoProfile = {
    displayName: profile.displayName.trim() || DEFAULT_PROFILE.displayName,
    city: profile.city.trim() || DEFAULT_PROFILE.city,
    role: profile.role === 'player' ? 'player' : 'host',
    avatar: (profile.displayName || DEFAULT_PROFILE.displayName).trim().charAt(0).toUpperCase() || DEFAULT_PROFILE.avatar,
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
}
