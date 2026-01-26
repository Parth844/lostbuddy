import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search } from "lucide-react";

interface SearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  genderFilter: string;
  setGenderFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  stateFilter: string;
  setStateFilter: (value: string) => void;
  ageRange: number[];
  setAgeRange: (value: number[]) => void;
}

const indianStates = [
  "All States",
  "DELHI",
  "HARYANA",
  "RAJASTHAN",
  "UTTAR PRADESH",
  "UTTRAKHAND",
];

const SearchFilters = ({
  searchTerm,
  setSearchTerm,
  genderFilter,
  setGenderFilter,
  statusFilter,
  setStatusFilter,
  stateFilter,
  setStateFilter,
  ageRange,
  setAgeRange,
}: SearchFiltersProps) => {
  return (
    <div className="space-y-6 p-6 bg-card border rounded-lg">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-card-foreground">
          Search & Filter
        </h3>
      </div>

      {/* Search by Name */}
      <div className="space-y-2">
        <Label htmlFor="search">Search by Name</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            placeholder="Enter name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Gender Filter */}
      <div className="space-y-2">
        <Label>Gender</Label>
        <Select value={genderFilter} onValueChange={setGenderFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Genders</SelectItem>
            <SelectItem value="Male">Male</SelectItem>
            <SelectItem value="Female">Female</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Status Filter */}
      <div className="space-y-2">
        <Label>Status</Label>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Traced">Traced</SelectItem>
            <SelectItem value="Untraced">Untraced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* State Filter */}
      <div className="space-y-2">
        <Label>State</Label>
        <Select value={stateFilter} onValueChange={setStateFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Select state" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {indianStates.map((state) => (
              <SelectItem key={state} value={state}>
                {state}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Age Range Filter */}
      <div className="space-y-3">
        <div className="flex justify-between">
          <Label>Age Range</Label>
          <span className="text-sm text-muted-foreground">
            {ageRange[0]} - {ageRange[1]} years
          </span>
        </div>
        <Slider
          min={0}
          max={100}
          step={1}
          value={ageRange}
          onValueChange={setAgeRange}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default SearchFilters;
