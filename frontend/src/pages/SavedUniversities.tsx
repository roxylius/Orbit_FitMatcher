import { useSavedUniversities } from '@/contexts';
import UniversityResultCard from '@/components/UniversityResultCard';
import InlineErrorBoundary from '@/components/ui/InlineErrorBoundary';
import { Button } from '@/components/ui/button';
import { Trash2, Bookmark } from 'lucide-react';

const SavedUniversities = () => {
  const { savedUniversities, clearAll } = useSavedUniversities();

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Saved Universities</h1>
          {savedUniversities.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAll}
              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 dark:border-red-800"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          Universities you've bookmarked for future reference
        </p>
      </div>

      {savedUniversities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <Bookmark className="w-10 h-10 text-slate-400 dark:text-slate-500" />
          </div>
          <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No saved universities yet</h2>
          <p className="text-slate-500 dark:text-slate-400 text-center max-w-md">
            Start exploring universities and click the bookmark icon to save them here for easy access later.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Showing {savedUniversities.length} saved {savedUniversities.length === 1 ? 'university' : 'universities'}
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {savedUniversities
              .sort((a, b) => {
                // Sort by savedAt date, most recent first
                const dateA = a.savedAt ? new Date(a.savedAt).getTime() : 0;
                const dateB = b.savedAt ? new Date(b.savedAt).getTime() : 0;
                return dateB - dateA;
              })
              .map((university) => (
                <InlineErrorBoundary key={university.university_id} fallbackMessage="Failed to load saved university">
                  <UniversityResultCard
                    university={university}
                  />
                </InlineErrorBoundary>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedUniversities;
