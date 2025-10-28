import { useEffect, useState } from 'react';
import UniversityCard from './UniversityCard';
import { useAppContext } from '../context/AppContext';
import { fetchUniversityMatches } from '../services/api';

const MatchResults = () => {
  const { userProfile } = useAppContext();
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadMatches = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch matches from API
        const data = await fetchUniversityMatches(userProfile);
        setUniversities(data);
      } catch (err) {
        console.error('Error fetching matches:', err);
        setError('Failed to load university matches. Please try again.');
        
        // Fallback to mock data
        setUniversities([
          {
            id: 1,
            name: 'Stanford University',
            location: 'Stanford, CA',
            matchScore: 85,
            ranking: 3,
            acceptanceRate: 4.3,
            averageGPA: 3.96,
            averageSAT: 1500,
            description: 'A prestigious private research university in Silicon Valley.',
          },
          {
            id: 2,
            name: 'MIT',
            location: 'Cambridge, MA',
            matchScore: 78,
            ranking: 2,
            acceptanceRate: 6.7,
            averageGPA: 3.95,
            averageSAT: 1530,
            description: 'Leading institution in technology and engineering.',
          },
          {
            id: 3,
            name: 'UC Berkeley',
            location: 'Berkeley, CA',
            matchScore: 72,
            ranking: 22,
            acceptanceRate: 14.5,
            averageGPA: 3.89,
            averageSAT: 1430,
            description: 'Top public university with excellent programs.',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, [userProfile]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Finding your perfect matches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <p className="text-yellow-700">{error}</p>
        <p className="text-sm text-yellow-600 mt-2">Showing sample results instead.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Your University Matches</h2>
        <p className="text-gray-600">
          Based on your profile, here are the universities that best match your qualifications.
        </p>
      </div>

      {universities.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No matches found. Please try adjusting your profile.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {universities.map((university) => (
            <UniversityCard key={university.id} university={university} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MatchResults;
