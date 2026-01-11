import Header from "../components/Header";
import Footer from "../components/Footer";
import { Leaf, Brain, Smartphone, TrendingUp } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
      <Header />

      {/* Hero Section */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="text-center mb-12">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-green-400 rounded-full blur-2xl opacity-30 animate-pulse" />
                <div className="relative bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-full shadow-xl">
                  <Leaf className="text-white" size={64} />
                </div>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
              Automated Maize Leaf
              <br />
              <span className="text-green-600">Disease Detection System</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Using Deep Learning and Computer Vision for Sustainable
              Agriculture
            </p>

            {/* CTA Button */}
            <a
              href="/detect"
              className="inline-block px-8 py-4 bg-green-500 text-white text-lg font-semibold rounded-xl hover:bg-green-600 transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              Upload Leaf Image
            </a>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            <FeatureCard
              icon={<Brain size={32} />}
              title="AI-Powered"
              description="Advanced deep learning models for accurate disease classification"
            />
            <FeatureCard
              icon={<Smartphone size={32} />}
              title="Easy to Use"
              description="Simple upload interface works on any device, anywhere"
            />
            <FeatureCard
              icon={<TrendingUp size={32} />}
              title="Fast Results"
              description="Get instant predictions with confidence scores"
            />
            <FeatureCard
              icon={<Leaf size={32} />}
              title="Sustainable"
              description="Early detection helps protect crops and increase yield"
            />
          </div>

          {/* How It Works */}
          <div className="mt-20 bg-white rounded-2xl shadow-lg p-8 sm:p-12 border border-gray-200">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Step
                number="1"
                title="Upload Image"
                description="Take or upload a clear photo of the maize leaf"
              />
              <Step
                number="2"
                title="AI Analysis"
                description="Our model analyzes the leaf for disease patterns"
              />
              <Step
                number="3"
                title="Get Results"
                description="Receive disease prediction with confidence score"
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="text-green-600 mb-3">{icon}</div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}

function Step({ number, title, description }) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500 text-white rounded-full font-bold text-xl mb-4">
        {number}
      </div>
      <h3 className="font-semibold text-gray-900 mb-2 text-lg">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}
