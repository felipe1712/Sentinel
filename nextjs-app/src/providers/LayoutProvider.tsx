"use client";

import React, { useState, ReactNode } from "react";
import { usePathname } from "next/navigation";
import SidebarMenu from "@/components/Layout/SidebarMenu";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import StateAccessGuard from "@/components/auth/StateAccessGuard";

interface LayoutProviderProps {
  children: ReactNode;
}

const LayoutProvider: React.FC<LayoutProviderProps> = ({ children }) => {
  const pathname = usePathname();

  const [active, setActive] = useState<boolean>(false);

  const toggleActive = () => {
    setActive(!active);
  };

  const isAuthPage =
    !pathname ||
    pathname === "/login" ||
    pathname === "/login/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/authentication/") ||
    [
      "/coming-soon/",
      "/coming-soon",
      "/",
      "/front-pages/features/",
      "/front-pages/team/",
      "/front-pages/faq/",
      "/front-pages/contact/",
    ].includes(pathname);

  if (isAuthPage) {
    return (
      <StateAccessGuard>
        <div className="w-full min-h-screen p-0 m-0 bg-[#0b1120]">
          {children}
        </div>
      </StateAccessGuard>
    );
  }

  return (
    <StateAccessGuard>
      <div
        className={`main-content-wrap transition-all ${active ? "active" : ""}`}
      >
        <SidebarMenu toggleActive={toggleActive} />
        <Header toggleActive={toggleActive} />

        <div className="main-content transition-all flex flex-col overflow-hidden min-h-screen">
          {children}
          <Footer />
        </div>
      </div>
    </StateAccessGuard>
  );
};


export default LayoutProvider;
