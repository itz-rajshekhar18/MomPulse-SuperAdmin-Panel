export default function MonitoringSection() {
  return (
    <div className="flex items-center justify-center gap-12 mt-12 pb-8">
      {/* Auth Flow Monitoring */}
      <div className="flex flex-col items-center gap-2">
        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
          <svg
            className="w-6 h-6 text-gray-400"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M3 13h2v8H3zm4-8h2v16H7zm4-2h2v18h-2zm4-2h2v20h-2zm4 4h2v16h-2zm4 8h2v8h-2z" />
          </svg>
        </div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Auth Flow Monitoring
        </p>
      </div>

      {/* System Integrity */}
      <div className="flex flex-col items-center gap-2">
        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
          <svg
            className="w-6 h-6 text-gray-400"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        </div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          System Integrity
        </p>
      </div>
    </div>
  );
}
