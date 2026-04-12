"use client";

import mainLogo from "@/assets/logos/main.png";
import darkLogo from "@/assets/logos/dark.png";
import Image from "next/image";
import { useTenant } from "@/lib/tenant/use-tenant";

export function Logo() {
  const { name } = useTenant();

  return (
    <div className="relative h-[50px] w-[50px]">
      <Image
        src={mainLogo}
        fill
        className="dark:hidden"
        alt={name}
        role="presentation"
        quality={100}
      />

      <Image
        src={darkLogo}
        fill
        className="hidden dark:block"
        alt={name}
        role="presentation"
        quality={100}
      />
    </div>
  );
}
