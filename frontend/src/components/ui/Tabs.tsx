import { type ReactNode, createContext, useContext, useState } from "react";
import { clsx } from "clsx";

interface TabsContextValue {
  active: string;
  setActive: (v: string) => void;
}

const TabsContext = createContext<TabsContextValue>({ active: "", setActive: () => {} });

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  children,
  className,
}: {
  defaultValue?: string;
  value?: string;
  onValueChange?: (v: string) => void;
  children: ReactNode;
  className?: string;
}) {
  const [internal, setInternal] = useState(defaultValue ?? "");
  const active = value ?? internal;
  const setActive = (v: string) => {
    setInternal(v);
    onValueChange?.(v);
  };
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div className={clsx("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={clsx(
        "inline-flex h-10 items-center rounded-lg bg-muted p-1 text-muted-foreground gap-1",
        className
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
  className,
}: {
  value: string;
  children: ReactNode;
  className?: string;
}) {
  const { active, setActive } = useContext(TabsContext);
  const isActive = active === value;
  return (
    <button
      type="button"
      onClick={() => setActive(value)}
      className={clsx(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isActive
          ? "bg-card text-foreground shadow-sm"
          : "hover:bg-card/60 hover:text-foreground",
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  children,
  className,
}: {
  value: string;
  children: ReactNode;
  className?: string;
}) {
  const { active } = useContext(TabsContext);
  if (active !== value) return null;
  return <div className={clsx("mt-4 animate-fade-in", className)}>{children}</div>;
}
