export const DbStatusIndicator = ({
  name,
  isOnline,
}: {
  name: string;
  isOnline: boolean;
}) => (
  <div className="flex items-center justify-between px-3 py-2 rounded-md bg-neutral-100 dark:bg-neutral-800">
    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
      {name}
    </span>

    <div className="flex items-center gap-2">
      <span
        className={`h-3 w-3 rounded-full ${
          isOnline ? "bg-green-500" : "bg-red-500"
        } animate-pulse`}
      />
      <span
        className={`text-xs font-medium ${
          isOnline ? "text-green-600" : "text-red-600"
        }`}
      >
        {isOnline ? "Online" : "Offline"}
      </span>
    </div>
  </div>
);
