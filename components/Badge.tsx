'use client';
import React from 'react';

export default function Badge({ children, color = 'green' }: { children: React.ReactNode, color?: 'green'|'red'|'yellow'|'gray' }) {
  const cls = {
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    gray: 'bg-gray-100 text-gray-800'
  }[color];
  return <span className={`px-2 py-1 rounded-full text-sm font-semibold ${cls}`}>{children}</span>;
}
