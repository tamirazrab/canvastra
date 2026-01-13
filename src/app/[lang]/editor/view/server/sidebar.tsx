import { Logo } from "../client/logo";
import { SidebarRoutes } from "../client/sidebar-routes";

export function Sidebar() {
  return (
    <aside className="hidden lg:flex fixed flex-col w-[300px] left-0 shrink-0 h-full">
      <Logo />
      <SidebarRoutes />
    </aside>
  );
}
