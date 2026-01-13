/**
 * Auth Layout Component
 *
 * This layout applies to all routes within the `(auth)` route group.
 * Route groups in Next.js (indicated by parentheses) allow you to organize routes
 * without affecting the URL structure. Routes in this group are:
 * - /[lang]/sign-in
 * - /[lang]/sign-up
 *
 * The layout provides a consistent background and styling for authentication pages.
 */
interface AuthLayoutProps {
  children: React.ReactNode;
}

function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="bg-[url(/bg.jpg)] bg-top bg-cover h-full flex flex-col">
      <div className="z-[4] h-full w-full flex flex-col items-center justify-center">
        <div className="h-full w-full md:h-auto md:w-[420px]">{children}</div>
      </div>
      <div className="fixed inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.8),rgba(0,0,0,.4),rgba(0,0,0,.8))] z-[1]" />
    </div>
  );
}

export default AuthLayout;
