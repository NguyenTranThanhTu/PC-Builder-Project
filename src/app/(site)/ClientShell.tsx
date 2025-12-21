"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ModalProvider } from "../context/QuickViewModalContext";
import { CartModalProvider } from "../context/CartSidebarModalContext";
import { ReduxProvider } from "@/redux/provider";
import { PreviewSliderProvider } from "../context/PreviewSliderContext";
import ScrollToTop from "@/components/Common/ScrollToTop";
import PreLoader from "@/components/Common/PreLoader";
import dynamic from "next/dynamic";
import { ChatProvider, ChatBot, ChatWindow, ChatBotAnnouncement } from "@/components/ChatBot";

// Lazy load heavy, rarely-visible modals to reduce initial JS
const QuickViewModal = dynamic(() => import("@/components/Common/QuickViewModal"), {
  ssr: false,
});
const CartSidebarModal = dynamic(
  () => import("@/components/Common/CartSidebarModal"),
  { ssr: false }
);
const PreviewSliderModal = dynamic(
  () => import("@/components/Common/PreviewSlider"),
  { ssr: false }
);

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState<boolean>(true);
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  if (loading) return <PreLoader />;

  return (
    <SessionProvider>
      <ReduxProvider>
        <CartModalProvider>
          <ModalProvider>
            <PreviewSliderProvider>
              <ChatProvider>
                {!isAdmin && <Header />}
                {!isAdmin && <ChatBotAnnouncement />}
                {children}
                {/* Lazy-loaded overlays for shop only */}
                {!isAdmin && (
                  <>
                    <QuickViewModal />
                    <CartSidebarModal />
                    {/* <PreviewSliderModal /> */}
                    {/* <ScrollToTop /> */}
                    {/* <Footer /> */}
                    
                    {/* AI ChatBot */}
                    <ChatBot />
                    <ChatWindow />
                  </>
                )}
              </ChatProvider>
            </PreviewSliderProvider>
          </ModalProvider>
        </CartModalProvider>
      </ReduxProvider>
    </SessionProvider>
  );
}
