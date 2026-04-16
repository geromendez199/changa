/**
 * WHY: Isolate geolocation and selected-location state from broader app data orchestration.
 * CHANGED: YYYY-MM-DD
 */
import { useCallback, useState } from "react";
import { updateProfileLocation } from "../services/profiles.service";
import { failureResult, successResult } from "../services/service.utils";
import { Profile } from "../types/domain";
import { useGeolocation } from "./useGeolocation";

interface UseLocationStateOptions {
  userId: string | null;
  pushError: (message?: string) => void;
}

export const DEFAULT_LOCATION = "Ubicación pendiente";

export function useLocationState({ userId, pushError }: UseLocationStateOptions) {
  const { coords, status, errorMessage: locationError, requestLocation } = useGeolocation();
  const [selectedLocation, setSelectedLocation] = useState(DEFAULT_LOCATION);

  const syncSelectedLocation = useCallback((location?: string | null) => {
    const nextLocation = location?.trim();
    setSelectedLocation(nextLocation ? nextLocation : DEFAULT_LOCATION);
  }, []);

  const resetSelectedLocation = useCallback(() => {
    setSelectedLocation(DEFAULT_LOCATION);
  }, []);

  const setManualLocation = useCallback(
    async (location: string) => {
      const trimmedLocation = location.trim();
      if (!trimmedLocation) {
        const message = "Ingresá una ubicación válida.";
        pushError(message);
        return failureResult<Profile | null>(null, message);
      }

      syncSelectedLocation(trimmedLocation);

      if (!userId) {
        return successResult<Profile | null>(null, "fallback");
      }

      const result = await updateProfileLocation(userId, trimmedLocation);
      pushError(result.error);

      if (result.data?.location) {
        syncSelectedLocation(result.data.location);
      }

      return result;
    },
    [pushError, syncSelectedLocation, userId],
  );

  return {
    selectedLocation,
    locationCoords: coords,
    locationStatus: status,
    locationError,
    requestDeviceLocation: requestLocation,
    setManualLocation,
    syncSelectedLocation,
    resetSelectedLocation,
  };
}
