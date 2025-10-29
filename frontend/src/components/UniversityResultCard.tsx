import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck, MapPin, TrendingUp } from 'lucide-react';
import { useSavedUniversities, type University } from '@/contexts';

interface UniversityResultCardProps {
  university: University;
  matchPercentage?: number;
  category?: 'Safety' | 'Target' | 'Reach';
  reasons?: string[];
  hideSaveButton?: boolean;
}

const UniversityResultCard = ({ 
  university, 
  matchPercentage, 
  category, 
  reasons,
  hideSaveButton = false 
}: UniversityResultCardProps) => {
  const { saveUniversity, removeUniversity, isUniversitySaved } = useSavedUniversities();
  const isSaved = isUniversitySaved(university.university_id);

  const handleSave = () => {
    if (isSaved) {
      removeUniversity(university.university_id);
    } else {
      saveUniversity(university);
    }
  };

  const getCategoryColor = (cat?: string) => {
    switch (cat) {
      case 'Safety':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Target':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Reach':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl font-bold text-slate-900 mb-1">
              {university.name}
            </CardTitle>
            <CardDescription className="text-base font-medium text-slate-700">
              {university.program_name}
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            {matchPercentage !== undefined && (
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {matchPercentage}%
                </div>
                {category && (
                  <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full border ${getCategoryColor(category)}`}>
                    {category}
                  </span>
                )}
              </div>
            )}
            
            {!hideSaveButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSave}
                className="h-10 w-10"
                title={isSaved ? 'Remove from saved' : 'Save university'}
              >
                {isSaved ? (
                  <BookmarkCheck className="h-5 w-5 text-blue-600 fill-blue-600" />
                ) : (
                  <Bookmark className="h-5 w-5 text-slate-400 hover:text-blue-600" />
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Location & Basic Info */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-500" />
            <span className="text-slate-700">
              {university.location_city}, {university.location_country}
            </span>
          </div>
          
          {university.ranking && (
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-slate-500" />
              <span className="text-slate-700">Ranking: #{university.ranking}</span>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t">
          {university.acceptance_rate && (
            <div>
              <p className="text-xs text-slate-500">Acceptance Rate</p>
              <p className="text-sm font-semibold text-slate-900">{university.acceptance_rate}%</p>
            </div>
          )}
          
          {university.tuition_usd && (
            <div>
              <p className="text-xs text-slate-500">Annual Tuition</p>
              <p className="text-sm font-semibold text-slate-900">
                ${university.tuition_usd.toLocaleString()}
              </p>
            </div>
          )}
          
          {university.median_gmat && (
            <div>
              <p className="text-xs text-slate-500">Median GMAT</p>
              <p className="text-sm font-semibold text-slate-900">{university.median_gmat}</p>
            </div>
          )}
          
          {university.median_gpa && (
            <div>
              <p className="text-xs text-slate-500">Median GPA</p>
              <p className="text-sm font-semibold text-slate-900">{university.median_gpa}</p>
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 pt-2">
          {university.scholarship_available && (
            <span className="px-2 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-full border border-green-200">
              Scholarships Available
            </span>
          )}
          {university.visa_sponsorship && (
            <span className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full border border-blue-200">
              Visa Sponsorship
            </span>
          )}
          {university.primary_industry && (
            <span className="px-2 py-1 text-xs font-medium bg-purple-50 text-purple-700 rounded-full border border-purple-200">
              {university.primary_industry}
            </span>
          )}
        </div>

        {/* Match Reasons */}
        {reasons && reasons.length > 0 && (
          <div className="pt-3 border-t">
            <p className="text-sm font-semibold text-slate-700 mb-2">Why this match:</p>
            <ul className="space-y-1">
              {reasons.map((reason, index) => (
                <li key={index} className="text-sm text-slate-600 flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Saved Date */}
        {university.savedAt && (
          <div className="pt-2 text-xs text-slate-500 italic">
            Saved on {new Date(university.savedAt).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UniversityResultCard;
