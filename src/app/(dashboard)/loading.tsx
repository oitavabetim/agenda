export default function DashboardLoading() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <div className="text-center">
        {/* Spinner */}
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 dark:border-blue-800 dark:border-t-blue-400" />
        
        {/* Texto de carregregando */}
        <p className="mt-4 text-sm font-medium text-gray-600 dark:text-gray-400">
          Carregando...
        </p>
      </div>
    </div>
  );
}
