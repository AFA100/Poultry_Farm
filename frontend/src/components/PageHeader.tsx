import { type ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

export default function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1 text-sm">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-3 shrink-0">{children}</div>}
    </div>
  );
}
