import FoodAnalysis from '@/components/FoodAnalysis'

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            KolayfitAI
          </h1>
          <p className="text-xl text-gray-600">
            AI destekli yemek tanıma ve kalori takibi
          </p>
        </div>
        
        <FoodAnalysis />
      </div>
    </div>
  );
};

export default Index;
