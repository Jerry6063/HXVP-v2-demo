import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function ErrorMessage({ message = 'Something went wrong', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <ExclamationTriangleIcon className="h-10 w-10 text-red-400 mb-3" />
      <p className="text-sm text-gray-600 mb-3">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
