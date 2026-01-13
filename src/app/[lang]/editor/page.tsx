import { Suspense } from "react";
import { protectServer } from "@/bootstrap/helpers/auth-utils";
import { Banner } from "./view/client/banner";
import { TemplatesSection } from "./view/server/templates-section";
import { ProjectsSection } from "./view/server/projects-section";

export default async function EditorPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  await protectServer(lang);

  return (
    <div className="flex flex-col space-y-6 max-w-screen-xl mx-auto pb-10">
      <Banner />
      <Suspense
        fallback={<div className="h-32 bg-muted rounded-lg animate-pulse" />}
      >
        <TemplatesSection />
      </Suspense>
      <Suspense
        fallback={<div className="h-32 bg-muted rounded-lg animate-pulse" />}
      >
        <ProjectsSection />
      </Suspense>
    </div>
  );
}
