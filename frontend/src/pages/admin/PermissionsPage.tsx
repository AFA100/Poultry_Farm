import { useQuery } from "@tanstack/react-query";
import { getPermissions, getPermissionGroups } from "@/api/permissions";
import PageHeader from "@/components/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import type { Permission, PermissionGroup } from "@/types/admin";

const ACTION_COLORS: Record<string, string> = {
  view:    "bg-amber-500/10 text-amber-700 border-amber-500/20",
  create:  "bg-orange-500/10 text-orange-700 border-orange-500/20",
  update:  "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
  delete:  "bg-red-500/10 text-red-600 border-red-500/20",
  approve: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  export:  "bg-blue-500/10 text-blue-700 border-blue-500/20",
  manage:  "bg-purple-500/10 text-purple-700 border-purple-500/20",
  archive: "bg-stone-500/10 text-stone-600 border-stone-500/20",
};

function ActionBadge({ action }: { action: string }) {
  const cls = ACTION_COLORS[action] ?? "bg-muted text-muted-foreground border-border";
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${cls}`}>
      {action}
    </span>
  );
}

export default function PermissionsPage() {
  const { data: permsData, isLoading } = useQuery({ queryKey: ["permissions"], queryFn: getPermissions });
  const { data: groupsData } = useQuery({ queryKey: ["permission-groups"], queryFn: getPermissionGroups });

  const allPerms: Permission[] = permsData?.data?.results ?? [];
  const groups: PermissionGroup[] = groupsData?.data?.results ?? [];

  // Group by module
  const byModule = allPerms.reduce<Record<string, Permission[]>>((acc, p) => {
    (acc[p.module] = acc[p.module] ?? []).push(p);
    return acc;
  }, {});

  const totalCount = allPerms.length;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Permissions"
        description="Read-only view of all system permissions. Assign them via Roles."
      />

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total</p>
          <p className="text-2xl font-bold text-foreground mt-1">{totalCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Modules</p>
          <p className="text-2xl font-bold text-foreground mt-1">{Object.keys(byModule).length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Groups</p>
          <p className="text-2xl font-bold text-foreground mt-1">{groups.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">System</p>
          <p className="text-2xl font-bold text-foreground mt-1">{allPerms.filter((p) => p.is_system).length}</p>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-32 rounded-xl" />
          ))}
        </div>
      )}

      {/* Per-module cards */}
      <div className="space-y-4">
        {Object.entries(byModule).map(([module, perms]) => (
          <Card key={module}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="capitalize">{module}</CardTitle>
                <span className="text-xs text-muted-foreground">{perms.length} permission{perms.length !== 1 ? "s" : ""}</span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2">
                {perms.map((perm) => (
                  <div
                    key={perm.id}
                    className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-1.5"
                    title={perm.description}
                  >
                    <ActionBadge action={perm.action} />
                    <span className="text-xs font-mono text-muted-foreground">{perm.permission_key}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
