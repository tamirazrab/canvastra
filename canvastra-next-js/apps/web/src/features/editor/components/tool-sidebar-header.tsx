interface ToolSidebarHeaderProps {
	title: string;
	description?: string;
}

export const ToolSidebarHeader = ({
	title,
	description,
}: ToolSidebarHeaderProps) => {
	return (
		<div className="h-[68px] space-y-1 border-b p-4">
			<p className="font-medium text-sm">{title}</p>
			{description && (
				<p className="text-muted-foreground text-xs">{description}</p>
			)}
		</div>
	);
};
