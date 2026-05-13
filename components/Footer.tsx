export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600">
            <p>© 2024 MomPulse Sanctuary. Designed for care.</p>
          </div>
          
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-sm text-gray-600 hover:text-gray-900 transition"
            >
              Privacy Protocol
            </a>
            <a
              href="#"
              className="text-sm text-gray-600 hover:text-gray-900 transition"
            >
              Terms of Access
            </a>
            <a
              href="#"
              className="text-sm text-gray-600 hover:text-gray-900 transition"
            >
              Doctor Support
            </a>
            <a
              href="#"
              className="text-sm text-gray-600 hover:text-gray-900 transition"
            >
              Admin Portal
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
