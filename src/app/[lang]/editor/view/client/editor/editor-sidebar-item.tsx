import type { LucideIcon } from "lucide-react";

import { cn } from "@/bootstrap/helpers/lib/ui-utils";
import { Button } from "@/app/components/ui/button";

interface EditorSidebarItemProps {
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
  onClick: () => void;
}

export function EditorSidebarItem({
  icon: Icon,
  label,
  isActive,
  onClick,
}: EditorSidebarItemProps) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={cn(
        "w-full h-full aspect-video p-3 py-4 flex flex-col rounded-none",
        isActive && "bg-muted text-primary",
      )}
    >
      <Icon className="size-5 stroke-2 shrink-0" />
      <span className="mt-2 text-xs">{label}</span>
    </Button>
  );
}
