"use client";

import { useState, useEffect } from "react";
import { X, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/client";

interface WelcomeBannerProps {
  onDismiss?: () => void;
}

export function WelcomeBanner({ onDismiss }: WelcomeBannerProps) {
  const t = useI18n();
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  // Mount animation
  useEffect(() => {
    setIsVisible(true);

    // Auto-dismiss after 10 seconds
    const timer = setTimeout(() => {
      handleDismiss();
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  // Handle ESC key for accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleDismiss();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss?.();
    }, 250); // Wait for animation to complete
  };

  const handleCTAClick = () => {
    router.push("/new-article");
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`
        transition-all duration-250 ease-out
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}
      `}
    >
      <div
        className="
          bg-[#F0F9FF]
          border-l-4 border-[#3BA2F8]
          rounded-[12px]
          p-4 md:p-6
          shadow-sm
        "
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Content */}
          <div className="flex items-start gap-3 flex-1">
            <div className="flex-shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5 text-[#3BA2F8]" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h3 className="text-[16px] font-semibold text-[#1E2A38] mb-1">{t("dashboard.banner.title")}</h3>
              <p className="text-[14px] text-[#374151] leading-[1.5]">
                {t("dashboard.banner.desc")}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 md:flex-shrink-0">
            <button
              onClick={handleCTAClick}
              className="
                bg-[#3BA2F8]
                text-white
                px-6
                py-2.5
                rounded-lg
                text-[14px]
                font-medium
                hover:bg-[#2d8fd9]
                transition-colors
                focus:outline-none
                focus:ring-2
                focus:ring-[#3BA2F8]
                focus:ring-offset-2
                h-[40px]
              "
              aria-label={t("dashboard.banner.cta_aria")}
            >
              {t("dashboard.banner.cta")}
            </button>
            <button
              onClick={handleDismiss}
              className="
                p-2
                text-[#6B7280]
                hover:text-[#374151]
                hover:bg-white/50
                rounded-lg
                transition-colors
                focus:outline-none
                focus:ring-2
                focus:ring-[#3BA2F8]
                focus:ring-offset-2
              "
              aria-label={t("dashboard.banner.close_aria")}
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
