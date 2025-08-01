import { FC } from 'react';

type SummaryCardProps = {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  description?: string;
};

const SummaryCard: FC<SummaryCardProps> = ({ title, value, icon, description }) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <div className="mt-2 text-2xl font-bold text-gray-800">{value}</div>
      {description && (
        <p className="mt-1 text-xs text-gray-400">{description}</p>
      )}
    </div>
  );
};

export default SummaryCard;