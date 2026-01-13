import { redirect } from "next/navigation";

export default async function Home(props: {
  params: Promise<{ lang: string }>;
}) {
  const { params } = props;
  const { lang } = await params;
  // Redirect root route to dashboard
  redirect(`/${lang}/dashboard`);
}
