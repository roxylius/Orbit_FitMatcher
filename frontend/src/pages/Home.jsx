import ProfileForm from '../components/ProfileForm';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Find Your Perfect University Match
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Answer a few questions about your academic profile and interests, and we'll help you
            discover universities that are the perfect fit for you.
          </p>
        </div>
        
        <ProfileForm />
      </div>
    </div>
  );
};

export default Home;
