import { useEffect, useRef, useState } from "react";
import Autocomplete from "react-google-autocomplete";
import { Input } from "@/components/ui/input";
import { FormControl } from "@/components/ui/form";
import { useQuery } from "@tanstack/react-query";

interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface AddressAutocompleteProps {
  value?: string;
  onChange?: (value: string) => void;
  onAddressSelect?: (addressData: {
    fullAddress: string;
    streetNumber: string;
    route: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }) => void;
  placeholder?: string;
  className?: string;
}

export default function AddressAutocomplete({
  value,
  onChange,
  onAddressSelect,
  placeholder = "Start typing your address...",
  className = "",
}: AddressAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value || "");

  // Fetch Google Maps API key
  const { data: config } = useQuery({
    queryKey: ['/api/config/google-maps-key'],
    retry: false,
  });

  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  const parseAddressComponents = (addressComponents: AddressComponent[]) => {
    const addressData = {
      fullAddress: "",
      streetNumber: "",
      route: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    };

    addressComponents.forEach((component) => {
      const types = component.types;
      
      if (types.includes("street_number")) {
        addressData.streetNumber = component.long_name;
      } else if (types.includes("route")) {
        addressData.route = component.long_name;
      } else if (types.includes("locality")) {
        addressData.city = component.long_name;
      } else if (types.includes("administrative_area_level_1")) {
        addressData.state = component.short_name;
      } else if (types.includes("postal_code")) {
        addressData.zipCode = component.long_name;
      } else if (types.includes("country")) {
        addressData.country = component.short_name;
      }
    });

    return addressData;
  };

  const handlePlaceSelected = (place: any) => {
    if (place.formatted_address) {
      const addressData = parseAddressComponents(place.address_components || []);
      addressData.fullAddress = place.formatted_address;
      
      setInputValue(place.formatted_address);
      onChange?.(place.formatted_address);
      onAddressSelect?.(addressData);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange?.(newValue);
  };

  // If Google Maps API key is not available, fall back to regular input
  if (!config?.apiKey) {
    return (
      <FormControl>
        <Input
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={className}
        />
      </FormControl>
    );
  }

  return (
    <FormControl>
      <Autocomplete
        apiKey={config.apiKey}
        onPlaceSelected={handlePlaceSelected}
        onChange={handleInputChange}
        value={inputValue}
        options={{
          types: ["address"],
          componentRestrictions: { country: "us" },
          fields: ["address_components", "formatted_address", "geometry"],
        }}
        placeholder={placeholder}
        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        style={{
          width: "100%",
          fontSize: "14px",
        }}
      />
    </FormControl>
  );
}