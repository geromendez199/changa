/**
 * WHY: Isolate profile and review state so profile persistence no longer lives inside the app-state God hook.
 * CHANGED: YYYY-MM-DD
 */
import { useCallback, useState } from "react";
import { getProfileBundle, getPublicProfiles, saveProfile } from "../services/profiles.service";
import { isNonEmptyString, successResult } from "../services/service.utils";
import { Profile, Review } from "../types/domain";

export interface SaveUserProfileInput {
  fullName: string;
  location: string;
  bio?: string;
  avatarUrl?: string;
}

interface UseProfileStateOptions {
  userId: string | null;
  pushError: (message?: string) => void;
}

const PROFILE_AVATAR_STORAGE_KEY = "changa-profile-avatar-urls";

const readPersistedAvatarUrls = (): Record<string, string> => {
  if (typeof window === "undefined") return {};

  try {
    const rawValue = window.localStorage.getItem(PROFILE_AVATAR_STORAGE_KEY);
    if (!rawValue) return {};

    const parsed = JSON.parse(rawValue);
    if (!parsed || typeof parsed !== "object") return {};

    return Object.entries(parsed).reduce<Record<string, string>>((acc, [key, value]) => {
      if (typeof value === "string" && value.trim()) {
        acc[key] = value.trim();
      }
      return acc;
    }, {});
  } catch {
    return {};
  }
};

const writePersistedAvatarUrl = (profileUserId: string, avatarUrl?: string) => {
  if (typeof window === "undefined" || !profileUserId) return;

  const current = readPersistedAvatarUrls();
  if (avatarUrl?.trim()) {
    current[profileUserId] = avatarUrl.trim();
  } else {
    delete current[profileUserId];
  }

  window.localStorage.setItem(PROFILE_AVATAR_STORAGE_KEY, JSON.stringify(current));
};

const applyPersistedAvatar = (profile: Profile): Profile => {
  const persisted = readPersistedAvatarUrls()[profile.id];
  return persisted ? { ...profile, avatarUrl: persisted } : profile;
};

export function useProfileState({ userId, pushError }: UseProfileStateOptions) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  const updateProfileInState = useCallback((profile: Profile) => {
    const nextProfile = applyPersistedAvatar(profile);
    setProfiles((prev) => [nextProfile, ...prev.filter((item) => item.id !== nextProfile.id)]);
    return nextProfile;
  }, []);

  const loadPublicProfiles = useCallback(async () => {
    const result = await getPublicProfiles();
    setProfiles(result.data.map(applyPersistedAvatar));
    pushError(result.error);
    return result;
  }, [pushError]);

  const refreshProfile = useCallback(
    async (profileUserId: string) => {
      if (!isNonEmptyString(profileUserId)) return successResult(null, "fallback");

      const profileResult = await getProfileBundle(profileUserId);
      pushError(profileResult.error);

      if (!profileResult.data) return profileResult;

      updateProfileInState(profileResult.data.profile);
      setReviews(profileResult.data.reviews);
      return profileResult;
    },
    [pushError, updateProfileInState],
  );

  const saveUserProfile = useCallback(
    async (input: SaveUserProfileInput) => {
      if (!userId) {
        return { ok: false, message: "Necesitás iniciar sesión para editar tu perfil." };
      }

      const result = await saveProfile(userId, {
        fullName: input.fullName,
        location: input.location,
        bio: input.bio,
      });

      if (!result.data) {
        const message = result.error ?? "No pudimos guardar tus datos";
        pushError(message);
        return { ok: false, message };
      }

      writePersistedAvatarUrl(userId, input.avatarUrl);
      const immediateProfile = updateProfileInState({
        ...result.data,
        avatarUrl: input.avatarUrl?.trim() || undefined,
      });
      const refreshResult = await refreshProfile(userId);
      const refreshedProfile = refreshResult.data?.profile
        ? applyPersistedAvatar(refreshResult.data.profile)
        : immediateProfile;

      return { ok: true, message: "Perfil guardado correctamente", profile: refreshedProfile };
    },
    [pushError, refreshProfile, updateProfileInState, userId],
  );

  const resetAuthenticatedProfileState = useCallback(() => {
    setReviews([]);
  }, []);

  return {
    profiles,
    reviews,
    loadPublicProfiles,
    refreshProfile,
    saveUserProfile,
    updateProfileInState,
    resetAuthenticatedProfileState,
  };
}
