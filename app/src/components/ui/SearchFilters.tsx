import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, Filter, RefreshCw } from "lucide-react";

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

  const handleReset = () => {
    setSearchTerm("");
    setGenderFilter("all");
    setStatusFilter("all");
    setStateFilter("All States");
    setAgeRange([0, 100]);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-t-xl">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#1E6BFF]" />
          <h3 className="font-semibold text-[#0B1A3E]">Filters</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="h-8 text-xs text-gray-500 hover:text-[#1E6BFF] hover:bg-blue-50"
        >
          <RefreshCw className="w-3 h-3 mr-1.5" />
          Reset
        </Button>
      </div>

      <div className="p-5 space-y-6">
        {/* Search by Name */}
        <div className="space-y-2.5">
          <Label htmlFor="search" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Search
          </Label>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-hover:text-[#1E6BFF] transition-colors" />
            <Input
              id="search"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-gray-50/50 border-gray-200 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Gender Filter */}
        <div className="space-y-2.5">
          <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Gender</Label>
          <Select value={genderFilter} onValueChange={setGenderFilter}>
            <SelectTrigger className="bg-gray-50/50 border-gray-200 focus:bg-white">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent className="!bg-white">
              <SelectItem value="all">All Genders</SelectItem>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="space-y-2.5">
          <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-gray-50/50 border-gray-200 focus:bg-white">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent className="!bg-white">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Traced">Traced</SelectItem>
              <SelectItem value="Untraced">Untraced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* State Filter */}
        <div className="space-y-2.5">
          <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">State</Label>
          <Select value={stateFilter} onValueChange={setStateFilter}>
            <SelectTrigger className="bg-gray-50/50 border-gray-200 focus:bg-white">
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent className="max-h-60 !bg-white">
              {indianStates.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Age Range Filter */}
        <div className="space-y-4 pt-2">
          <div className="flex justify-between items-center">
            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Age Range</Label>
            <span className="text-xs font-medium text-[#1E6BFF] bg-blue-50 px-2 py-0.5 rounded-full">
              {ageRange[0]} - {ageRange[1]} yrs
            </span>
          </div>
          <Slider
            min={0}
            max={100}
            step={1}
            value={ageRange}
            onValueChange={setAgeRange}
            className="w-full py-1.5"
          />
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
