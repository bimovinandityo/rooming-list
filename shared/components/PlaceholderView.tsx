export function PlaceholderView({ title, description }: { title: string; description?: string }) {
  return (
    <>
      <div className="px-8 pt-6 pb-5 shrink-0 bg-white border-b border-gray-100">
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto bg-white flex items-center justify-center">
        <div className="text-center max-w-sm px-6 py-12">
          <p className="text-sm font-medium text-gray-700">Coming soon</p>
          <p className="text-xs text-gray-400 mt-1">
            {description ?? `${title} isn’t built out yet — placeholder for navigation testing.`}
          </p>
        </div>
      </div>
    </>
  );
}
