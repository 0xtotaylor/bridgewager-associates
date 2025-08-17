'use client';

import * as React from 'react';

export function PortfolioManagerDashboard() {
  return (
    <div className="p-6 border-4 border-green-500 rounded-lg bg-green-50 dark:bg-green-950">
      <h2 className="text-3xl font-bold text-green-700 dark:text-green-300">
        🎯 PORTFOLIO MANAGER DASHBOARD 🎯
      </h2>
      <p className="mt-4 text-green-600 dark:text-green-400 text-lg">
        ✅ SUCCESS! This is the PORTFOLIO MANAGER specific dashboard component.
      </p>
      <div className="mt-4 p-4 bg-green-100 dark:bg-green-900 rounded">
        <p className="text-green-800 dark:text-green-200 font-semibold">
          This component only shows for /team/portfolio-manager
        </p>
      </div>
    </div>
  );
}