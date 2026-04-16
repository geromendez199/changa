/**
 * WHY: Isolate profile and review state so profile persistence no longer lives inside the app-state God hook.
 * CHANGED: YYYY-MM-DD
 */
import { useCallback, useState } from "react";
import {
  getProfileBundle,
  getPublicProfiles,
  removeProfileAvatar,
  saveProfile,
  uploadProfileAvatar,
} from "../services/profiles.service";
import { isNonEmptyString, successResult } from "../services/service.utils";
import { Profile, Review } from "../types/domain";

export interface SaveUserProfileInput {
  fullName: string;
  location: string;
  bio?: string;
  avatarFile?: File | null;
  removeAvatar?: boolean;
}

interface UseProfileStateOptions {
  userId: string | null;
  pushError: (message?: string) => void;
}

export function useProfileState({ userId, pushError }: UseProfileStateOptions) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  const updateProfileInState = useCallback((profile: Profile) => {
    setProfiles((prev) => [profile, ...prev.filter((item) => item.id !== profile.id)]);
    return profile;
  }, []);

  const loadPublicProfiles = useCallback(async () => {
    const result = await getPublicProfiles();
    setProfiles(result.data);
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

      let nextAvatarUrl: string | null | undefined;

      if (input.removeAvatar) {
        const removeResult = await removeProfileAvatar(userId);
        if (removeResult.error) {
          pushError(removeResult.error);
          return { ok: false, message: removeResult.error };
        }
        nextAvatarUrl = null;
      } else if (input.avatarFile) {
        const uploadResult = await uploadProfileAvatar(userId, input.avatarFile);
        if (!uploadResult.data) {
          const message = uploadResult.error ?? "No pudimos subir tu foto de perfil.";
          pushError(message);
          return { ok: false, message };
        }
        nextAvatarUrl = uploadResult.data;
      }

      const result = await saveProfile(userId, {
        fullName: input.fullName,
        location: input.location,
        bio: input.bio,
        avatarUrl: nextAvatarUrl,
      });

      if (!result.data) {
        const message = result.error ?? "No pudimos guardar tus datos";
        pushError(message);
        return { ok: false, message };
      }

      const immediateProfile = updateProfileInState(result.data);
      const refreshResult = await refreshProfile(userId);
      const refreshedProfile = refreshResult.data?.profile ?? immediateProfile;

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
