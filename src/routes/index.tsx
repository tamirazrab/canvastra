// src/routes/_dashboard/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import { Banner } from "@/app/(dashboard)/banner";
import { ProjectsSection } from "@/app/(dashboard)/projects-section";
import { TemplatesSection } from "@/app/(dashboard)/templates-section";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="flex flex-col space-y-6 max-w-screen-xl mx-auto pb-10">
      <Banner />
      <TemplatesSection />
      <ProjectsSection />
    </div>
  );
}

