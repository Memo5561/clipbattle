"use client";

import {usePathname} from "next/navigation";
import Navbar from "./navbar";

export default function LayoutShell({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isFeedPage = pathname?.endsWith("/feed");

  return (
    <>
      {!isFeedPage && <Navbar />}

      {isFeedPage ? (
        children
      ) : (
        <main className="mx-auto max-w-7xl px-4 py-6 pb-28 sm:px-6 sm:py-8 md:pb-8">
          {children}
        </main>
      )}
    </>
  );
}