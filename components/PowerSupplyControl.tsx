'use client';

import { Zap } from 'lucide-react';

export default function PowerSupplyControl() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Zap className="h-12 w-12 text-yellow-400 mb-4" />
      <h2 className="text-xl font-semibold mb-2">Power Supply Control</h2>
      <p className="text-gray-400 max-w-md">
        TC/HF/LETID/PID power supply monitoring and Modbus RTU/TCP interface.
        Coming in Session 4: Power Supply Configurator.
      </p>
    </div>
  );
}
