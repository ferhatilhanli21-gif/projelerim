interface StatusBadgeProps {
  isActive: boolean;
}

export function StatusBadge({ isActive }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
        isActive
          ? 'bg-green-100 text-green-700'
          : 'bg-gray-100 text-gray-500'
      }`}
    >
      <span
        className={`w-2 h-2 rounded-full ${
          isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
        }`}
      />
      {isActive ? 'Mesaide' : 'Mesai Dışı'}
    </span>
  );
}
