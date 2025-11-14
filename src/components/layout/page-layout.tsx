"use client";

import type { ReactNode } from "react";

interface PageLayoutProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  maxWidthClassName?: string;
}

export function PageLayout({
  title,
  description,
  actions,
  children,
  maxWidthClassName = "max-w-6xl",
}: PageLayoutProps) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FCFCFD" }}>
      <div className={`container mx-auto ${maxWidthClassName} px-4 py-8`}>
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: "#1F2937" }}>
                {title}
              </h1>
              {description && (
                <p className="mt-2 text-base" style={{ color: "#6B7280" }}>
                  {description}
                </p>
              )}
            </div>
            {actions && <div className="flex gap-2">{actions}</div>}
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}

