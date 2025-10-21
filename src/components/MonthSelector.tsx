type MonthSelectorProps = {
  value: string;
  onChange: (month: string) => void;
};

export const MonthSelector = ({ value, onChange }: MonthSelectorProps) => {
  return (
    <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
      Month
      <input
        type="month"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </label>
  );
};
