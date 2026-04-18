import { UserCircle, X } from 'lucide-react';

interface Props {
  user: any;
  onClose?: () => void;
}

export default function UserStats({ user, onClose }: Props) {
  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">User Statistics</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
            <X size={24} />
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <UserCircle size={48} className="text-gray-400" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{user.full_name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Courses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">0%</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Completion</div>
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button
              onClick={() => {}}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
