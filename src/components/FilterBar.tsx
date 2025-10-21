import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Star } from "lucide-react";

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCity: string;
  onCityChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  cities: string[];
  showFavoritesOnly?: boolean;
  onToggleFavoritesOnly?: () => void;
}

export const FilterBar = ({
  searchQuery,
  onSearchChange,
  selectedCity,
  onCityChange,
  selectedStatus,
  onStatusChange,
  cities,
  showFavoritesOnly = false,
  onToggleFavoritesOnly,
}: FilterBarProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search respawns by code or name..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <Select value={selectedCity} onValueChange={onCityChange}>
        <SelectTrigger className="w-full md:w-[200px]">
          <SelectValue placeholder="Filter by city" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Cities</SelectItem>
          {cities.map((city) => (
            <SelectItem key={city} value={city}>
              {city}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedStatus} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full md:w-[200px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="available">Available</SelectItem>
          <SelectItem value="claimed">Claimed</SelectItem>
        </SelectContent>
      </Select>

      {onToggleFavoritesOnly && (
        <Button
          variant={showFavoritesOnly ? "default" : "outline"}
          className={`w-full md:w-auto ${
            showFavoritesOnly 
              ? 'bg-yellow-500 hover:bg-yellow-600 text-black' 
              : 'border-yellow-500 text-yellow-500 hover:bg-yellow-500/10'
          }`}
          onClick={onToggleFavoritesOnly}
        >
          <Star 
            className="h-4 w-4 mr-2" 
            fill={showFavoritesOnly ? 'currentColor' : 'none'}
          />
          Favorites Only
        </Button>
      )}
    </div>
  );
};
