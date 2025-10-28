const UniversityCard = ({ university }) => {
  const getMatchColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">{university.name}</h3>
          <p className="text-gray-600">{university.location}</p>
        </div>
        <div className={`px-4 py-2 rounded-full ${getMatchColor(university.matchScore)}`}>
          <span className="font-bold">{university.matchScore}%</span>
        </div>
      </div>

      {university.description && (
        <p className="text-gray-700 mb-4">{university.description}</p>
      )}

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-600">Ranking:</span>
          <span className="font-semibold ml-2">#{university.ranking}</span>
        </div>
        <div>
          <span className="text-gray-600">Acceptance Rate:</span>
          <span className="font-semibold ml-2">{university.acceptanceRate}%</span>
        </div>
        <div>
          <span className="text-gray-600">Average GPA:</span>
          <span className="font-semibold ml-2">{university.averageGPA.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-gray-600">Average SAT:</span>
          <span className="font-semibold ml-2">{university.averageSAT}</span>
        </div>
      </div>

      <button className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition">
        Learn More
      </button>
    </div>
  );
};

export default UniversityCard;
