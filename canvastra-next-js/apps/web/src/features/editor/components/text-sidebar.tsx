import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";
import type { ActiveTool, Editor } from "@/features/editor/types";
import { cn } from "@/lib/utils";

interface TextSidebarProps {
	editor: Editor | undefined;
	activeTool: ActiveTool;
	onChangeActiveTool: (tool: ActiveTool) => void;
}

export const TextSidebar = ({
	editor,
	activeTool,
	onChangeActiveTool,
}: TextSidebarProps) => {
	const onClose = () => {
		onChangeActiveTool("select");
	};

	return (
		<aside
			className={cn(
				"relative z-[40] flex h-full w-[360px] flex-col border-r bg-white",
				activeTool === "text" ? "visible" : "hidden",
			)}
		>
			<ToolSidebarHeader title="Text" description="Add text to your canvas" />
			<ScrollArea>
				<div className="space-y-4 border-b p-4">
					<Button className="w-full" onClick={() => editor?.addText("Textbox")}>
						Add a textbox
					</Button>
					<Button
						className="h-16 w-full"
						variant="secondary"
						size="lg"
						onClick={() =>
							editor?.addText("Heading", {
								fontSize: 80,
								fontWeight: 700,
							})
						}
					>
						<span className="font-bold text-3xl">Add a heading</span>
					</Button>
					<Button
						className="h-16 w-full"
						variant="secondary"
						size="lg"
						onClick={() =>
							editor?.addText("Subheading", {
								fontSize: 44,
								fontWeight: 600,
							})
						}
					>
						<span className="font-semibold text-xl">Add a subheading</span>
					</Button>
					<Button
						className="h-16 w-full"
						variant="secondary"
						size="lg"
						onClick={() =>
							editor?.addText("Paragraph", {
								fontSize: 32,
							})
						}
					>
						Paragraph
					</Button>
				</div>
			</ScrollArea>
			<ToolSidebarClose onClick={onClose} />
		</aside>
	);
};
