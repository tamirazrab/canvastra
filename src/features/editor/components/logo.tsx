import { Link } from "@tanstack/react-router";

export const Logo = () => {
  return (
    <Link to="/">
      <div className="size-8 relative shrink-0">
        <img
          src="/logo.svg"
          alt="The Canvas"
          className="w-full h-full shrink-0 hover:opacity-75 transition"
        />
      </div>
    </Link>
  );
};
