import { Link } from "@tanstack/react-router";

export const Logo = () => {
  return (
    <Link to="/">
      <div className="flex items-center gap-x-2 hover:opacity-75 transition h-[68px] px-4">
        <div className="size-8 relative">
          <img src="/logo.svg" alt="The Canvas" className="w-full h-full" />
        </div>
        <h1 className="text-xl font-bold font-space-grotesk">The Canvas</h1>
      </div>
    </Link>
  );
};
