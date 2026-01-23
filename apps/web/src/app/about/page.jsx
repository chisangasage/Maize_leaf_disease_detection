import Header from "../../components/Header";
import Footer from "../../components/Footer";
import FloatingWeatherWidget from "../../components/FloatingWeatherWidget";
import { Code, Database, Cpu, Globe, Leaf, BarChart } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              About This Project
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              An academic research project leveraging artificial intelligence
              for agricultural sustainability
            </p>
          </div>

          {/* Problem Statement */}
          <section className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-200 mb-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <Leaf className="text-orange-600" size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Problem Statement
                </h2>
                <p className="text-gray-600">
                  Maize is a critical staple crop worldwide, but diseases
                  significantly reduce crop yields and threaten food security.
                  Traditional disease identification requires expert knowledge
                  and is time-consuming, often leading to delayed treatment and
                  crop loss.
                </p>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Early and accurate detection of maize leaf diseases is essential
              for effective crop management. Farmers, especially in
              resource-limited settings, need accessible tools to identify
              diseases quickly and take appropriate action to protect their
              crops.
            </p>
          </section>

          {/* Solution */}
          <section className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-200 mb-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Cpu className="text-green-600" size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Our Solution
                </h2>
                <p className="text-gray-600">
                  Deep learning-powered disease detection system
                </p>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              This project implements a Convolutional Neural Network (CNN)
              trained on thousands of maize leaf images to automatically
              classify diseases. The model analyzes visual patterns and symptoms
              to provide instant, accurate predictions with confidence scores.
            </p>
            <p className="text-gray-700 leading-relaxed">
              By deploying this model as a web application, we make advanced AI
              technology accessible to farmers, students, and researchers
              worldwide—requiring only a smartphone or computer with internet
              access.
            </p>
          </section>

          {/* Technologies Used */}
          <section className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-200 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Technologies Used
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <TechCard
                icon={<Code size={24} />}
                title="Python"
                description="Core programming language for model development and backend"
                color="blue"
              />
              <TechCard
                icon={<Cpu size={24} />}
                title="TensorFlow / Keras"
                description="Deep learning frameworks for CNN model training"
                color="orange"
              />
              <TechCard
                icon={<Database size={24} />}
                title="FastAPI"
                description="High-performance backend API for model serving"
                color="green"
              />
              <TechCard
                icon={<Globe size={24} />}
                title="React"
                description="Modern frontend framework for user interface"
                color="cyan"
              />
              <TechCard
                icon={<BarChart size={24} />}
                title="Tailwind CSS"
                description="Utility-first CSS framework for responsive design"
                color="indigo"
              />
              <TechCard
                icon={<Leaf size={24} />}
                title="Computer Vision"
                description="Image processing and feature extraction techniques"
                color="green"
              />
            </div>
          </section>

          {/* Methodology */}
          <section className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-200 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Methodology
            </h2>
            <div className="space-y-4">
              <MethodStep
                number="1"
                title="Data Collection"
                description="Gathered and curated a dataset of maize leaf images representing various disease classes and healthy leaves"
              />
              <MethodStep
                number="2"
                title="Model Training"
                description="Trained a Convolutional Neural Network using transfer learning and data augmentation techniques"
              />
              <MethodStep
                number="3"
                title="Model Evaluation"
                description="Validated model performance using accuracy, precision, recall, and F1-score metrics"
              />
              <MethodStep
                number="4"
                title="Deployment"
                description="Deployed the model using FastAPI backend and React frontend for real-world accessibility"
              />
            </div>
          </section>

          {/* Academic Context */}
          <section className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 sm:p-8 border border-green-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              Academic Research Project
            </h2>
            <p className="text-gray-700 leading-relaxed text-center max-w-3xl mx-auto">
              This system was developed as part of academic research in applied
              machine learning and agricultural technology. The project
              demonstrates the practical application of deep learning for
              solving real-world agricultural challenges and contributes to the
              growing field of precision agriculture.
            </p>
          </section>
        </div>
      </main>

      <Footer />
      <FloatingWeatherWidget />
    </div>
  );
}

function TechCard({ icon, title, description, color }) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    orange: "bg-orange-100 text-orange-600",
    green: "bg-green-100 text-green-600",
    cyan: "bg-cyan-100 text-cyan-600",
    indigo: "bg-indigo-100 text-indigo-600",
  };

  return (
    <div className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
      <div
        className={`inline-block p-2 rounded-lg mb-3 ${colorClasses[color]}`}
      >
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}

function MethodStep({ number, title, description }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
          {number}
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </div>
  );
}
