"use client";

import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
// Removed Firebase import - using custom location types

export interface Suggestion {
  description: string;
  place_id: string;
}

export const usePlaces = () => {
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      /* Define search scope here */
    },
    debounce: 300,
  });

  const isPlacePredictionsLoading = status !== "" && status !== "OK" && status !== "ZERO_RESULTS";

  const getPlacePredictions = (val: string) => {
    setValue(val);
  };

  const getPlaceDetails = async (placeId: string) => {
    const results = await getGeocode({ placeId });
    const { lat, lng } = await getLatLng(results[0]);
    return {
      address: results[0].formatted_address,
      geopoint: { latitude: lat, longitude: lng },
    };
  };

  return {
    ready,
    value,
    placePredictions: data,
    isPlacePredictionsLoading,
    getPlacePredictions,
    getPlaceDetails,
    clearSuggestions,
  };
};