import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { API_BASE_URL } from '@/lib/config';

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
      
      // TODO: Navigate to results page or display results
      alert(`Found ${data.count} matches!`);
    } catch (error) {
      console.error('Error:', error);
      alert('Error fetching matches. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-6 lg:mb-8 pt-12 lg:pt-0">
        <div className="inline-block px-4 py-1 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-3">
          <span className="text-sm font-semibold text-blue-700">AI-Powered Matching</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-2">
          Fit Matcher
        </h1>
        <p className="text-slate-600 text-base sm:text-lg">
          Find universities that match your academic profile and career goals
        </p>
      </div>

      <Card className="max-w-5xl shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-2xl">Your Academic Profile</CardTitle>
          <CardDescription className="text-base">
            Fill in your details to get personalized university recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                  <Label htmlFor="gmat_score">GMAT Score (200-800)</Label>
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
                  <Label htmlFor="gre_score">GRE Score (260-340)</Label>
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
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select program type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MBA">MBA</SelectItem>
                    <SelectItem value="MS CS">MS Computer Science</SelectItem>
                    <SelectItem value="MS Finance">MS Finance</SelectItem>
                    <SelectItem value="MS Analytics">MS Analytics</SelectItem>
                    <SelectItem value="MS Data Science">MS Data Science</SelectItem>
                    <SelectItem value="MS Engineering">MS Engineering</SelectItem>
                    <SelectItem value="MIM">MIM (Master in Management)</SelectItem>
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
                  <Input
                    id="industry_preference"
                    value={formData.industry_preference}
                    onChange={(e) => setFormData({ ...formData, industry_preference: e.target.value })}
                    placeholder="e.g., Tech, Finance, Consulting"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input
                    id="nationality"
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    placeholder="e.g., India, USA, China"
                    className="mt-1.5"
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="preferred_location">Preferred Location</Label>
                  <Input
                    id="preferred_location"
                    value={formData.preferred_location}
                    onChange={(e) => setFormData({ ...formData, preferred_location: e.target.value })}
                    placeholder="e.g., USA, Canada, UK"
                    className="mt-1.5"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="visa_required"
                    checked={formData.visa_required}
                    onChange={(e) => setFormData({ ...formData, visa_required: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="visa_required" className="cursor-pointer font-normal">
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
    </div>
  );
};

export default FitMatcher;
