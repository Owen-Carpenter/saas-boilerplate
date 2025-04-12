'use client';

import React from 'react';
import { ReactNode } from 'react';

interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: ReactNode;
}

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  className = '',
  children
}: TabsProps) {
  const [activeTab, setActiveTab] = React.useState(value || defaultValue || '');

  React.useEffect(() => {
    if (value !== undefined) {
      setActiveTab(value);
    }
  }, [value]);

  const handleValueChange = (newValue: string) => {
    if (!value) {
      setActiveTab(newValue);
    }
    onValueChange?.(newValue);
  };

  // Clone children and pass the active tab value to them
  const enhancedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        activeTab,
        onValueChange: handleValueChange,
      } as any);
    }
    return child;
  });

  return (
    <div className={`w-full ${className}`}>
      {enhancedChildren}
    </div>
  );
}

interface TabsListProps {
  className?: string;
  children: ReactNode;
  activeTab?: string;
  onValueChange?: (value: string) => void;
}

export function TabsList({ className = '', children, activeTab, onValueChange }: TabsListProps) {
  // Clone TabsTrigger children and pass activeTab and onValueChange
  const enhancedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        activeTab,
        onValueChange,
      } as any);
    }
    return child;
  });

  return (
    <div className={`flex border-b border-[#0ff0fc]/20 mb-4 ${className}`}>
      {enhancedChildren}
    </div>
  );
}

interface TabsTriggerProps {
  value: string;
  className?: string;
  children: ReactNode;
  activeTab?: string;
  onValueChange?: (value: string) => void;
}

export function TabsTrigger({
  value,
  className = '',
  children,
  activeTab,
  onValueChange
}: TabsTriggerProps) {
  const isActive = activeTab === value;

  return (
    <button
      className={`px-4 py-2 text-sm font-medium transition-all ${
        isActive
          ? 'text-[#0ff0fc] border-b-2 border-[#0ff0fc] text-glow-cyan'
          : 'text-gray-400 hover:text-[#0ff0fc]'
      } ${className}`}
      onClick={() => onValueChange?.(value)}
      data-state={isActive ? 'active' : 'inactive'}
    >
      {children}
    </button>
  );
}

interface TabsContentProps {
  value: string;
  className?: string;
  children: ReactNode;
  activeTab?: string;
}

export function TabsContent({
  value,
  className = '',
  children,
  activeTab
}: TabsContentProps) {
  const isActive = activeTab === value;

  if (!isActive) return null;

  return (
    <div
      className={`mt-2 ${className}`}
      data-state={isActive ? 'active' : 'inactive'}
    >
      {children}
    </div>
  );
} 