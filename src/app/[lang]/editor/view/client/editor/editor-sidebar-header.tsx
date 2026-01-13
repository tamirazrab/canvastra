interface EditorSidebarHeaderProps {
  title: string;
  description?: string;
}

export function EditorSidebarHeader({
  title,
  description,
}: EditorSidebarHeaderProps) {
  return (
    <div className="p-4 border-b space-y-1 h-[68px]">
      <p className="text-sm font-medium">{title}</p>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
