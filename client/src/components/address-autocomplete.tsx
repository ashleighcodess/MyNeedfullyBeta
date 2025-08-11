import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";

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
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  // Search addresses using OpenStreetMap Nominatim API
  const searchAddresses = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=8&countrycodes=us&q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      
      const addressSuggestions = data
        .filter((item: any) => item.display_name && item.address)
        .map((item: any) => item.display_name)
        .slice(0, 6);

      setSuggestions(addressSuggestions);
      setShowDropdown(addressSuggestions.length > 0);
    } catch (error) {
      console.warn('Address search failed:', error);
      setSuggestions([]);
      setShowDropdown(false);
    } finally {
      setLoading(false);
    }
  };

  // Parse address from Nominatim response
  const parseAddressFromString = (fullAddress: string) => {
    // Basic parsing - this could be enhanced
    const parts = fullAddress.split(', ');
    
    return {
      fullAddress,
      streetNumber: "", // Would need more sophisticated parsing
      route: parts[0] || "",
      city: parts[parts.length - 4] || "",
      state: parts[parts.length - 3] || "",
      zipCode: parts[parts.length - 2] || "",
      country: "US",
    };
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue && inputValue.length > 2) {
        searchAddresses(inputValue);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange?.(newValue);
    
    if (newValue.length < 3) {
      setShowDropdown(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    onChange?.(suggestion);
    setShowDropdown(false);
    
    // Parse and pass address data if callback provided
    if (onAddressSelect) {
      const addressData = parseAddressFromString(suggestion);
      onAddressSelect(addressData);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`pl-10 ${className}`}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowDropdown(true);
            }
          }}
          onBlur={() => {
            // Delay hiding dropdown to allow clicks
            setTimeout(() => setShowDropdown(false), 200);
          }}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-coral"></div>
          </div>
        )}
      </div>
      
      {/* Address Suggestions Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none first:rounded-t-md last:rounded-b-md"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="flex items-center">
                <MapPin className="h-3 w-3 text-gray-400 mr-2 flex-shrink-0" />
                <span className="text-sm truncate">{suggestion}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}