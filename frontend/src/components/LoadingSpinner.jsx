export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-3" />
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  );
}
