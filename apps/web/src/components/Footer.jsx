export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-gray-600 text-sm">
          <p className="mb-2">
            <span className="font-semibold text-gray-900">
              Cavendish University Zambia Research Project
            </span>
          </p>
          <p className="mb-1">Automated Maize Leaf Disease Detection System</p>
          <p className="text-gray-500">
            © {currentYear} - Developed for Academic Research
          </p>
        </div>
      </div>
    </footer>
  );
}
