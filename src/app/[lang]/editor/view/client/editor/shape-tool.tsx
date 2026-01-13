"use client";

import type { IconType } from "react-icons";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/bootstrap/helpers/lib/ui-utils";

interface ShapeToolProps {
  onClick: () => void;
  icon: LucideIcon | IconType;
  iconClassName?: string;
}

export function ShapeTool({
  onClick,
  icon: Icon,
  iconClassName,
}: ShapeToolProps) {
  return (
    <button onClick={onClick} className="aspect-square border rounded-md p-5">
      <Icon className={cn("h-full w-full", iconClassName)} />
    </button>
  );
}
