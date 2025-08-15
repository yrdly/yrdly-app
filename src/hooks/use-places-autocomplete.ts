
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

export function usePlacesAutocomplete() {
    const placesLibrary = useMapsLibrary('places');
    const [placesService, setPlacesService] = useState<google.maps.places.PlacesService | null>(null);
    const [autocompleteService, setAutocompleteService] = useState<google.maps.places.AutocompleteService | null>(null);
    const [placePredictions, setPlacePredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
    const [isPlacePredictionsLoading, setIsPlacePredictionsLoading] = useState(false);

    useEffect(() => {
        if (placesLibrary) {
            // The PlacesService requires a map instance, but we can create a dummy one.
            const map = new google.maps.Map(document.createElement('div'));
            setPlacesService(new placesLibrary.PlacesService(map));
            setAutocompleteService(new placesLibrary.AutocompleteService());
        }
    }, [placesLibrary]);

    const getPlacePredictions = useCallback((request: google.maps.places.AutocompletionRequest) => {
        if (autocompleteService) {
            setIsPlacePredictionsLoading(true);
            autocompleteService.getPlacePredictions(request, (predictions, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
                    setPlacePredictions(predictions);
                } else {
                    setPlacePredictions([]);
                }
                setIsPlacePredictionsLoading(false);
            });
        }
    }, [autocompleteService]);

    return {
        placesService,
        autocompleteService,
        placePredictions,
        isPlacePredictionsLoading,
        getPlacePredictions
    };
}
