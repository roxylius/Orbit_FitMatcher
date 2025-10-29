import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { API_BASE_URL } from '@/lib/config';
import UniversityResultCard from '@/components/UniversityResultCard';
import { useSearch } from '@/contexts';

interface SearchFilters {
  program: string;
  location_country: string;
  min_acceptance: string;
  max_acceptance: string;
  visa_sponsorship: string;
  min_tuition: string;
  max_tuition: string;
  min_ranking: string;
  max_ranking: string;
  has_scholarships: string;
  sort_by: string;
  order: string;
}

const Search = () => {
  const { searchResults, setSearchResults, hasSearched, setHasSearched, clearSearchResults } = useSearch();
  
  const [filters, setFilters] = useState<SearchFilters>({
    program: '',
    location_country: '',
    min_acceptance: '',
    max_acceptance: '',
    visa_sponsorship: '',
    min_tuition: '',
    max_tuition: '',
    min_ranking: '',
    max_ranking: '',
    has_scholarships: '',
    sort_by: 'ranking',
    order: 'asc',
  });

  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

  const response = await fetch(`${API_BASE_URL}/search?${params.toString()}`, {
        credentials: 'include',
      });
      const data = await response.json();
      
      console.log('Search results:', data);
      setSearchResults(data.universities || []);
      setHasSearched(true);
    } catch (error) {
      console.error('Error:', error);
      setSearchResults([]);
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFilters({
      program: '',
      location_country: '',
      min_acceptance: '',
      max_acceptance: '',
      visa_sponsorship: '',
      min_tuition: '',
      max_tuition: '',
      min_ranking: '',
      max_ranking: '',
      has_scholarships: '',
      sort_by: 'ranking',
      order: 'asc',
    });
    clearSearchResults();
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-6 lg:mb-8 pt-12 lg:pt-0">
        <div className="inline-block px-4 py-1 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full mb-3">
          <span className="text-sm font-semibold text-purple-700">Advanced Search</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-2">
          Search Universities
        </h1>
        <p className="text-slate-600 text-base sm:text-lg">
          Filter and search through our comprehensive database of universities
        </p>
      </div>

      <Card className="max-w-5xl shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-2xl">Search Filters</CardTitle>
          <CardDescription className="text-base">
            Use filters to narrow down your university search
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-6">
            {/* Program and Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="program">Program Type</Label>
                <Select
                  value={filters.program || undefined}
                  onValueChange={(value) => setFilters({ ...filters, program: value })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="All programs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Programs</SelectItem>
                    <SelectItem value="MBA">MBA</SelectItem>
                    <SelectItem value="MS CS">MS Computer Science</SelectItem>
                    <SelectItem value="MS Finance">MS Finance</SelectItem>
                    <SelectItem value="MS Analytics">MS Analytics</SelectItem>
                    <SelectItem value="MS Data Science">MS Data Science</SelectItem>
                    <SelectItem value="MS Engineering">MS Engineering</SelectItem>
                    <SelectItem value="MIM">MIM</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="location_country">Country</Label>
                <Input
                  id="location_country"
                  value={filters.location_country}
                  onChange={(e) => setFilters({ ...filters, location_country: e.target.value })}
                  placeholder="e.g., USA, Canada, UK"
                  className="mt-1.5"
                />
              </div>
            </div>

            {/* Acceptance Rate Range */}
            <div>
              <Label className="mb-2 block font-semibold">Acceptance Rate (%)</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={filters.min_acceptance}
                    onChange={(e) => setFilters({ ...filters, min_acceptance: e.target.value })}
                    placeholder="Min (e.g., 5)"
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={filters.max_acceptance}
                    onChange={(e) => setFilters({ ...filters, max_acceptance: e.target.value })}
                    placeholder="Max (e.g., 20)"
                  />
                </div>
              </div>
            </div>

            {/* Tuition Range */}
            <div>
              <Label className="mb-2 block font-semibold">Annual Tuition (USD)</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Input
                    type="number"
                    min="0"
                    value={filters.min_tuition}
                    onChange={(e) => setFilters({ ...filters, min_tuition: e.target.value })}
                    placeholder="Min (e.g., 30,000)"
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    min="0"
                    value={filters.max_tuition}
                    onChange={(e) => setFilters({ ...filters, max_tuition: e.target.value })}
                    placeholder="Max (e.g., 60,000)"
                  />
                </div>
              </div>
            </div>

            {/* Ranking Range */}
            <div>
              <Label className="mb-2 block font-semibold">Ranking Range</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Input
                    type="number"
                    min="1"
                    value={filters.min_ranking}
                    onChange={(e) => setFilters({ ...filters, min_ranking: e.target.value })}
                    placeholder="Min (e.g., 1)"
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    min="1"
                    value={filters.max_ranking}
                    onChange={(e) => setFilters({ ...filters, max_ranking: e.target.value })}
                    placeholder="Max (e.g., 50)"
                  />
                </div>
              </div>
            </div>

            {/* Boolean Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="visa_sponsorship">Visa Sponsorship</Label>
                <Select
                  value={filters.visa_sponsorship || undefined}
                  onValueChange={(value) => setFilters({ ...filters, visa_sponsorship: value })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="has_scholarships">Scholarships Available</Label>
                <Select
                  value={filters.has_scholarships || undefined}
                  onValueChange={(value) => setFilters({ ...filters, has_scholarships: value })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Sort Options */}
            <div className="pt-4 border-t">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>Sort Results</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sort_by">Sort By</Label>
                  <Select
                    value={filters.sort_by}
                    onValueChange={(value) => setFilters({ ...filters, sort_by: value })}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ranking">Ranking</SelectItem>
                      <SelectItem value="acceptance_rate">Acceptance Rate</SelectItem>
                      <SelectItem value="tuition_usd">Tuition</SelectItem>
                      <SelectItem value="avg_starting_salary_usd">Starting Salary</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="order">Order</Label>
                  <Select
                    value={filters.order}
                    onValueChange={(value) => setFilters({ ...filters, order: value })}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Ascending</SelectItem>
                      <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button type="submit" className="flex-1 h-12 text-base font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Searching...
                  </span>
                ) : (
                  'Search Universities'
                )}
              </Button>
              <Button type="button" variant="outline" onClick={handleReset} className="h-12 px-8 font-semibold">
                Reset Filters
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results Section */}
      {hasSearched && (
        <div className="mt-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Search Results
            </h2>
            <p className="text-slate-600">
              {searchResults.length === 0 
                ? 'No universities found matching your criteria. Try adjusting your filters.' 
                : `Showing ${searchResults.length} ${searchResults.length === 1 ? 'university' : 'universities'}`
              }
            </p>
          </div>

          {searchResults.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {searchResults.map((university) => (
                <UniversityResultCard
                  key={university.university_id}
                  university={university}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
