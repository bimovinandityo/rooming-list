"use client";

import { QueryProvider } from "@/providers/query-provider";
import { IntlProvider } from "react-intl";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "sonner";
import type { ReactNode } from "react";
import { RoomingListProvider } from "@/features/rooming-list/context/RoomingListContext";

import enMessages from "@/locales/compiled/en.json";
import frMessages from "@/locales/compiled/fr.json";

const messages: Record<string, Record<string, string>> = {
  en: enMessages,
  fr: frMessages,
};

function getLocale(): string {
  if (typeof navigator === "undefined") return "en";
  const browserLang = navigator.language.split("-")[0];
  return browserLang in messages ? browserLang : "en";
}

export function Providers({ children }: { children: ReactNode }) {
  const locale = getLocale();

  return (
    <NuqsAdapter>
      <IntlProvider locale={locale} messages={messages[locale]} defaultLocale="en">
        <QueryProvider>
          <RoomingListProvider>{children}</RoomingListProvider>
          <Toaster position="bottom-right" richColors />
        </QueryProvider>
      </IntlProvider>
    </NuqsAdapter>
  );
}
