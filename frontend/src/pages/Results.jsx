import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import MatchResults from '../components/MatchResults';

const Results = () => {
  const navigate = useNavigate();
  const { userProfile } = useAppContext();

  // Redirect to home if no profile exists
  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Profile Found</h2>
          <p className="text-gray-600 mb-6">Please create your profile first to see matches.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Profile</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Name:</span>
              <span className="font-semibold ml-2">{userProfile.name}</span>
            </div>
            <div>
              <span className="text-gray-600">GPA:</span>
              <span className="font-semibold ml-2">{userProfile.gpa}</span>
            </div>
            <div>
              <span className="text-gray-600">SAT:</span>
              <span className="font-semibold ml-2">{userProfile.satScore}</span>
            </div>
            <div>
              <span className="text-gray-600">Interests:</span>
              <span className="font-semibold ml-2">{userProfile.interests}</span>
            </div>
            <div>
              <span className="text-gray-600">Location:</span>
              <span className="font-semibold ml-2">{userProfile.location}</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Edit Profile
          </button>
        </div>

        <MatchResults />
      </div>
    </div>
  );
};

export default Results;
