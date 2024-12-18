import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  isActive?: boolean;
  onClick?: () => void;
}

export const SidebarItem = ({
  icon: Icon,
  label,
  href,
  isActive,
  onClick,
}: SidebarItemProps) => {
  // Handle external links (mailto, etc.)
  if (href.startsWith("http") || href.startsWith("mailto")) {
    return (
      <a href={href} onClick={onClick}>
        <div className={cn(
          "flex items-center px-3 py-3 rounded-xl bg-transparent hover:bg-white transition",
          isActive && "bg-white",
        )}>
          <Icon className="size-4 mr-2 stroke-2" />
          <span className="text-sm font-medium">
            {label}
          </span>
        </div>
      </a>
    );
  }

  return (
    <Link to={href as any} onClick={onClick}>
      <div className={cn(
        "flex items-center px-3 py-3 rounded-xl bg-transparent hover:bg-white transition",
        isActive && "bg-white",
      )}>
        <Icon className="size-4 mr-2 stroke-2" />
        <span className="text-sm font-medium">
          {label}
        </span>
      </div>
    </Link>
  );
};
