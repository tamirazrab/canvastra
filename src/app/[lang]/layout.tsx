import { ThemeProvider } from "@/app/[lang]/dashboard/components/client/theme-provider/theme-provider";
import { getI18n, LANGS } from "@/bootstrap/i18n/i18n";
import TranslationsProvider from "@/bootstrap/i18n/i18n-provider";
import { Modals } from "@/app/components/modals";
import { Providers } from "@/app/components/providers";
import { SubscriptionAlert } from "@/app/[lang]/subscription/view/client/subscription-alert/subscription-alert";
import { Toaster } from "@/app/components/ui/sonner";
import { ErrorBoundaryWrapper } from "@/app/components/error-boundary-wrapper";
import localFont from "next/font/local";
import { PropsWithChildren } from "react";

const geistSans = localFont({
  src: "./../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});
const geistMono = localFont({
  src: "./../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});

export default async function layout(
  props: PropsWithChildren & { params: Promise<{ lang: string }> },
) {
  const { params, children } = props;
  const { lang } = await params;
  // Validate and cast to LANGS enum
  const validLang = Object.values(LANGS).includes(lang as LANGS) ? (lang as LANGS) : LANGS.EN;
  await getI18n({ lng: validLang });

  return (
    <html lang={validLang} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ErrorBoundaryWrapper>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <Providers>
              <TranslationsProvider lng={validLang}>
                <Toaster />
                <Modals />
                <SubscriptionAlert />
                {children}
              </TranslationsProvider>
            </Providers>
          </ThemeProvider>
        </ErrorBoundaryWrapper>
      </body>
    </html>
  );
}
