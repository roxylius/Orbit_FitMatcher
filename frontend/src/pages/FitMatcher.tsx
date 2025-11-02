import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { API_BASE_URL } from '@/lib/config';
import UniversityResultCard from '@/components/UniversityResultCard';
import InlineErrorBoundary from '@/components/ui/InlineErrorBoundary';
import { useSearch, useMetadata } from '@/contexts';

interface FormData {
  gmat_score: string;
  gre_score: string;
  gpa: string;
  gpa_scale: string;
  work_experience: string;
  program_type: string;
  industry_preference: string;
  nationality: string;
  visa_required: boolean;
  preferred_location: string;
}

const FitMatcher = () => {
  const { matchResults, setMatchResults, hasMatched, setHasMatched } = useSearch();
  const { metadata, metadataLoading } = useMetadata();
  
  const [formData, setFormData] = useState<FormData>({
    gmat_score: '',
    gre_score: '',
    gpa: '',
    gpa_scale: '4.0',
    work_experience: '',
    program_type: '',
    industry_preference: '',
    nationality: '',
    visa_required: false,
    preferred_location: '',
  });

  const [testType, setTestType] = useState<'gmat' | 'gre' | ''>('');
  const [loading, setLoading] = useState(false);

  const handleQuickFill = () => {
    // Fill test type
    setTestType('gmat');
    
    
    // Fill form data
    setFormData({
      gmat_score: '719',
      gre_score: '',
      gpa: '3.47',
      gpa_scale: '4.0',
      work_experience: '2',
      program_type: 'MBA',
      industry_preference: '',
      nationality: '',
      preferred_location: 'USA',
      visa_required: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = {
        gpa: parseFloat(formData.gpa),
        gpa_scale: parseFloat(formData.gpa_scale),
        work_experience: parseInt(formData.work_experience),
        program_type: formData.program_type,
      };

      if (testType === 'gmat' && formData.gmat_score) {
        payload.gmat_score = parseInt(formData.gmat_score);
      } else if (testType === 'gre' && formData.gre_score) {
        payload.gre_score = parseInt(formData.gre_score);
      }

      if (formData.industry_preference) payload.industry_preference = formData.industry_preference;
      if (formData.nationality) payload.nationality = formData.nationality;
      if (formData.visa_required) payload.visa_required = formData.visa_required;
      if (formData.preferred_location) payload.preferred_location = formData.preferred_location;

  const response = await fetch(`${API_BASE_URL}/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('Match results:', data);
      
      setMatchResults(data.matches || []);
      setHasMatched(true);
    } catch (error) {
      console.error('Error:', error);
      setMatchResults([]);
      setHasMatched(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-6 lg:mb-8 pt-12 lg:pt-0">
        <div className="inline-block px-4 py-1 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full mb-3">
          <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">AI-Powered Matching</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Fit Matcher
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg">
          Find universities that match your academic profile and career goals
        </p>
      </div>

      {metadataLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
            <div className="w-5 h-5 border-2 border-slate-300 dark:border-slate-600 border-t-blue-600 rounded-full animate-spin" />
            <span>Loading form options...</span>
          </div>
        </div>
      )}

      <Card className="max-w-5xl shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-2xl dark:text-slate-100">Your Academic Profile</CardTitle>
          <CardDescription className="text-base dark:text-slate-400">
            Fill in your details to get personalized university recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Quick Fill Button for Testing */}
          <div className="mb-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="text-sm text-amber-900 dark:text-amber-300">
                <p className="font-semibold">Demo Profile</p>
                <p className="text-xs text-amber-700 dark:text-amber-400">Quick fill form with sample data</p>
              </div>
              <Button
                type="button"
                onClick={handleQuickFill}
                size="sm"
                variant="outline"
                className="bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-slate-700 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-300"
                disabled={loading || metadataLoading}
              >
                Quick Fill
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Test Score Section */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Test Score *</Label>
              <Select value={testType || undefined} onValueChange={(value: any) => setTestType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select test type (GMAT or GRE)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gmat">GMAT</SelectItem>
                  <SelectItem value="gre">GRE</SelectItem>
                </SelectContent>
              </Select>

              {testType === 'gmat' && (
                <div>
                  <Label htmlFor="gmat_score" className='pb-2'>GMAT Score (200-800)</Label>
                  <Input
                    id="gmat_score"
                    type="number"
                    min="200"
                    max="800"
                    value={formData.gmat_score}
                    onChange={(e) => setFormData({ ...formData, gmat_score: e.target.value })}
                    placeholder="e.g., 700"
                    required
                  />
                </div>
              )}

              {testType === 'gre' && (
                <div>
                  <Label htmlFor="gre_score" className='pb-2'>GRE Score (260-340)</Label>
                  <Input
                    id="gre_score"
                    type="number"
                    min="260"
                    max="340"
                    value={formData.gre_score}
                    onChange={(e) => setFormData({ ...formData, gre_score: e.target.value })}
                    placeholder="e.g., 320"
                    required
                  />
                </div>
              )}
            </div>

            {/* GPA Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gpa">GPA *</Label>
                <Input
                  id="gpa"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.gpa}
                  onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                  placeholder="e.g., 3.5"
                  className="mt-1.5"
                  required
                />
              </div>
              <div>
                <Label htmlFor="gpa_scale">GPA Scale</Label>
                <Select
                  value={formData.gpa_scale}
                  onValueChange={(value) => setFormData({ ...formData, gpa_scale: value })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4.0">4.0</SelectItem>
                    <SelectItem value="5.0">5.0</SelectItem>
                    <SelectItem value="10.0">10.0</SelectItem>
                    <SelectItem value="100.0">100.0</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Work Experience */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="work_experience">Work Experience (years) *</Label>
                <Input
                  id="work_experience"
                  type="number"
                  min="0"
                  value={formData.work_experience}
                  onChange={(e) => setFormData({ ...formData, work_experience: e.target.value })}
                  placeholder="e.g., 3"
                  className="mt-1.5"
                  required
                />
              </div>

              {/* Program Type */}
              <div className="sm:col-span-1">
                <Label htmlFor="program_type">Program Type *</Label>
                <Select
                  value={formData.program_type || undefined}
                  onValueChange={(value) => setFormData({ ...formData, program_type: value })}
                  disabled={metadataLoading}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder={metadataLoading ? "Loading..." : "Select program type"} />
                  </SelectTrigger>
                  <SelectContent>
                    {metadata?.programTypes.map((program) => (
                      <SelectItem key={program} value={program}>
                        {program}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Optional Fields */}
            <div className="pt-4 border-t">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="text-slate-400">Optional Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="industry_preference">Industry Preference</Label>
                  <Select
                    value={formData.industry_preference || undefined}
                    onValueChange={(value) => setFormData({ ...formData, industry_preference: value === 'none' ? '' : value })}
                    disabled={metadataLoading}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder={metadataLoading ? "Loading..." : "Select industry"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {metadata?.industries.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="nationality">Nationality</Label>
                  <Select
                    value={formData.nationality || undefined}
                    onValueChange={(value) => setFormData({ ...formData, nationality: value === 'none' ? '' : value })}
                    disabled={metadataLoading}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder={metadataLoading ? "Loading..." : "Select nationality"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Not specified</SelectItem>
                      {metadata?.countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="preferred_location">Preferred Location</Label>
                  <Select
                    value={formData.preferred_location || undefined}
                    onValueChange={(value) => setFormData({ ...formData, preferred_location: value === 'none' ? '' : value })}
                    disabled={metadataLoading}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder={metadataLoading ? "Loading..." : "Select preferred country"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No preference</SelectItem>
                      {metadata?.countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="sm:col-span-2 flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <input
                    type="checkbox"
                    id="visa_required"
                    checked={formData.visa_required}
                    onChange={(e) => setFormData({ ...formData, visa_required: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 dark:bg-slate-700"
                  />
                  <Label htmlFor="visa_required" className="cursor-pointer font-normal dark:text-slate-300">
                    I require visa sponsorship
                  </Label>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Finding Matches...
                </span>
              ) : (
                'Find My Matches'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Match Results Section */}
      {hasMatched && (
        <div className="mt-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Your Matches
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              {matchResults.length === 0 
                ? 'No matching universities found. Try adjusting your profile details or consider alternative programs.' 
                : `Found ${matchResults.length} ${matchResults.length === 1 ? 'match' : 'matches'} based on your profile`
              }
            </p>
          </div>

          {matchResults.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {matchResults.map((match) => (
                <InlineErrorBoundary key={match.university.university_id} fallbackMessage="Failed to load match result">
                  <UniversityResultCard
                    university={match.university}
                    matchPercentage={match.match_percentage}
                    category={match.category}
                    reasons={match.reasons}
                  />
                </InlineErrorBoundary>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FitMatcher;
