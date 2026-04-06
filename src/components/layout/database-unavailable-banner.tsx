type DatabaseUnavailableBannerProps = {
  resourceName: string;
};

export function DatabaseUnavailableBanner({ resourceName }: DatabaseUnavailableBannerProps) {
  return (
    <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      {resourceName} are temporarily unavailable because the application could not connect to the database.
    </div>
  );
}
