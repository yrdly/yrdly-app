
"use client";

import { useEffect, useState, useRef } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { usePlacesAutocomplete } from '@/hooks/use-places-autocomplete';
import { useDebounce } from 'use-debounce';
import { Skeleton } from './ui/skeleton';
import { GeoPoint } from 'firebase/firestore';

export interface LocationValue {
  address: string;
  geopoint?: GeoPoint;
}

interface LocationInputProps {
  name: string;
  control: any;
  defaultValue?: LocationValue;
}

export function LocationInput({ name, control, defaultValue }: LocationInputProps) {
  const { setValue } = useFormContext();
  const { getPlacePredictions, placePredictions, isPlacePredictionsLoading, placesService } = usePlacesAutocomplete();
  const [inputValue, setInputValue] = useState(defaultValue?.address || '');
  const [debouncedInputValue] = useDebounce(inputValue, 500);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debouncedInputValue && debouncedInputValue.length > 2) {
      getPlacePredictions({ input: debouncedInputValue });
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [debouncedInputValue, getPlacePredictions]);

  useEffect(() => {
    // Handle clicks outside of the component to close suggestions
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [containerRef]);

  const handleSelect = (prediction: google.maps.places.AutocompletePrediction) => {
    setInputValue(prediction.description);
    setShowSuggestions(false);

    placesService?.getDetails({ placeId: prediction.place_id, fields: ['geometry.location', 'formatted_address'] }, (place, status) => {
      if (status === 'OK' && place?.geometry?.location) {
        const locationValue: LocationValue = {
          address: place.formatted_address || prediction.description,
          geopoint: new GeoPoint(place.geometry.location.lat(), place.geometry.location.lng()),
        };
        setValue(name, locationValue, { shouldValidate: true, shouldDirty: true });
      }
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAddress = e.target.value;
    setInputValue(newAddress);
    // If user is typing manually, update form value with address only
    setValue(name, { address: newAddress }, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className="relative" ref={containerRef}>
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        render={({ field }) => (
          <Input
            {...field}
            placeholder="Enter a location"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => setShowSuggestions(placePredictions.length > 0)}
            autoComplete="off"
          />
        )}
      />
      {showSuggestions && (
        <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg">
          {isPlacePredictionsLoading ? (
            <div className="p-2 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : (
            <ul className="py-1">
              {placePredictions.map((prediction) => (
                <li
                  key={prediction.place_id}
                  onClick={() => handleSelect(prediction)}
                  className="px-3 py-2 cursor-pointer hover:bg-accent"
                >
                  {prediction.description}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
