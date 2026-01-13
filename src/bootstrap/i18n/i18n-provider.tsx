"use client";

import { I18nextProvider } from "react-i18next";
import { getI18n, LANGS } from "@/bootstrap/i18n/i18n";
import { PropsWithChildren, useEffect, useState } from "react";
import { i18n } from "i18next";
import storeLang from "@/bootstrap/i18n/store-lang-action";

export default function TranslationsProvider({
  children,
  lng,
}: PropsWithChildren & { lng: LANGS }) {
  const [i18nInstance, setI18nInstance] = useState<i18n | null>(null);

  useEffect(() => {
    (async () => {
      storeLang(lng);
      const { i18n: i18nValue } = await getI18n({ lng });
      setI18nInstance(i18nValue);
    })();
  }, [lng]);

  // Always render children to maintain consistent hook order
  // If i18n is not ready, children will still render but translations may not work until i18n is loaded
  if (!i18nInstance) {
    return <>{children}</>;
  }

  return <I18nextProvider i18n={i18nInstance}>{children}</I18nextProvider>;
}
