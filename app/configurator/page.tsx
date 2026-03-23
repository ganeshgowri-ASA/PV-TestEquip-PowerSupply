'use client';

export default function ConfiguratorPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-screen-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Power Supply Configurator</h1>
        <p className="text-gray-400 mb-6">
          TC/HF · LETID · PID recipe builder, module profiles, ABSI calculator
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['TC/HF — Bidirectional 60V/30A', 'LETID — Precision 60V/2A', 'PID — High Voltage ±4000V DC'].map(
            (ps) => (
              <div
                key={ps}
                className="bg-gray-900 border border-gray-700 rounded-lg p-4 hover:border-blue-600 transition-colors cursor-pointer"
              >
                <h2 className="font-semibold text-blue-300">{ps}</h2>
                <p className="text-xs text-gray-500 mt-1">Click to configure</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
