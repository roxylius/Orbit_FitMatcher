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
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700';
      case 'Target':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700';
      case 'Reach':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-600';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 dark:bg-slate-800 dark:border-slate-700">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
              {university.name}
            </CardTitle>
            <CardDescription className="text-base font-medium text-slate-700 dark:text-slate-300">
              {university.program_name}
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            {matchPercentage !== undefined && (
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
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
                className="h-10 w-10 dark:hover:bg-slate-700"
                title={isSaved ? 'Remove from saved' : 'Save university'}
              >
                {isSaved ? (
                  <BookmarkCheck className="h-5 w-5 text-blue-600 dark:text-blue-400 fill-blue-600 dark:fill-blue-400" />
                ) : (
                  <Bookmark className="h-5 w-5 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400" />
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
            <MapPin className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <span className="text-slate-700 dark:text-slate-300">
              {university.location_city}, {university.location_country}
            </span>
          </div>
          
          {university.ranking && (
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              <span className="text-slate-700 dark:text-slate-300">Ranking: #{university.ranking}</span>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t dark:border-slate-700">
          {university.acceptance_rate && (
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Acceptance Rate</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{university.acceptance_rate}%</p>
            </div>
          )}
          
          {university.tuition_usd && (
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Annual Tuition</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                ${university.tuition_usd.toLocaleString()}
              </p>
            </div>
          )}
          
          {university.median_gmat && (
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Median GMAT</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{university.median_gmat}</p>
            </div>
          )}
          
          {university.median_gpa && (
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Median GPA</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{university.median_gpa}</p>
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 pt-2">
          {university.scholarship_available && (
            <span className="px-2 py-1 text-xs font-medium bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full border border-green-200 dark:border-green-700">
              Scholarships Available
            </span>
          )}
          {university.visa_sponsorship && (
            <span className="px-2 py-1 text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-700">
              Visa Sponsorship
            </span>
          )}
          {university.primary_industry && (
            <span className="px-2 py-1 text-xs font-medium bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full border border-purple-200 dark:border-purple-700">
              {university.primary_industry}
            </span>
          )}
        </div>

        {/* Match Reasons */}
        {reasons && reasons.length > 0 && (
          <div className="pt-3 border-t dark:border-slate-700">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Why this match:</p>
            <ul className="space-y-1">
              {reasons.map((reason, index) => (
                <li key={index} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Saved Date */}
        {university.savedAt && (
          <div className="pt-2 text-xs text-slate-500 dark:text-slate-400 italic">
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
