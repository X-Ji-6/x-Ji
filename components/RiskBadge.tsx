
import React from 'react';
import { RiskLevel } from '../types';

interface RiskBadgeProps {
  level: RiskLevel;
  className?: string;
}

const RiskBadge: React.FC<RiskBadgeProps> = ({ level, className = "" }) => {
  const styles = {
    [RiskLevel.LOW]: "bg-emerald-100 text-emerald-700 border-emerald-200",
    [RiskLevel.MEDIUM]: "bg-amber-100 text-amber-700 border-amber-200",
    [RiskLevel.HIGH]: "bg-rose-100 text-rose-700 border-rose-200",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[level]} ${className}`}>
      {level}
    </span>
  );
};

export default RiskBadge;
