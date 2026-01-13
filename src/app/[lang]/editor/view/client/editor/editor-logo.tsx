"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";

export function EditorLogo() {
  const params = useParams();
  const lang = (params.lang as string) || "en";

  return (
    <Link href={`/${lang}/editor`}>
      <div className="size-8 relative shrink-0">
        <Image
          src="/logo.svg"
          fill
          alt="The Canvas"
          className="shrink-0 hover:opacity-75 transition"
        />
      </div>
    </Link>
  );
}
