import { protectServer } from "@/bootstrap/helpers/auth-utils";
import { Banner } from "@/app/[lang]/editor/view/client/banner";
import { TemplatesSection } from "@/app/[lang]/editor/view/server/templates-section";
import { ProjectsSection } from "@/app/[lang]/editor/view/server/projects-section";

export default async function Dashboard(props: {
  params: Promise<{ lang: string }>;
}) {
  const { params } = props;
  const { lang } = await params;

  // Use better-auth to check authentication and redirect if not authenticated
  await protectServer(lang);

  // Show canva-clone ported dashboard (same as editor home)
  return (
    <div className="flex flex-col space-y-6 max-w-screen-xl mx-auto pb-10">
      <Banner />
      <TemplatesSection />
      <ProjectsSection />
    </div>
  );
}
