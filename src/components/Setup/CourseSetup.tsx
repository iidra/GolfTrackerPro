import { Flag, Droplet, Trees, MapPin, Target } from 'lucide-react';
import { useGolfStore } from '../../store/useGolfStore';

export default function CourseSetup() {
  const { setupMode, setSetupMode } = useGolfStore();

  const setupOptions = [
    { mode: 'tee', icon: MapPin, label: 'Set Tee' },
    { mode: 'hole', icon: Target, label: 'Set Hole' },
    { mode: 'green', icon: Flag, label: 'Set Green' },
    { mode: 'obstacles', icon: Trees, label: 'Add Obstacles' },

  ] as const;

  return (
    <div className="fixed top-20 right-4 bg-white rounded-lg shadow-md p-4 space-y-2">
      <h3 className="font-semibold text-lg mb-4">Course Setup</h3>
      <div className="space-y-2">
        {setupOptions.map(({ mode, icon: Icon, label }) => (
          <button
            key={mode}
            onClick={() => setSetupMode(setupMode === mode ? null : mode)}
            className={`
              w-full flex items-center space-x-2 px-4 py-2 rounded-lg
              ${setupMode === mode
                ? 'bg-green-600 text-white'
                : 'hover:bg-gray-100 text-gray-700'}
            `}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
