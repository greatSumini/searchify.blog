"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { WelcomeHeader } from "@/components/dashboard/welcome-header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ActivityChart } from "@/components/dashboard/activity-chart";
import { RecentArticlesList } from "@/components/dashboard/recent-articles-list";
import { WelcomeBanner } from "@/components/dashboard/welcome-banner";

type DashboardPageProps = {
  params: Promise<Record<string, never>>;
};

const WELCOME_SHOWN_KEY = "onboarding_welcome_shown";

function DashboardContent() {
  const { user } = useCurrentUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false);

  console.log("[DASHBOARD] Component mounted, user:", user?.email);
  console.log("[DASHBOARD] Current URL:", window.location.href);
  console.log("[DASHBOARD] searchParams:", {
    welcome: searchParams.get("welcome"),
    onboarding_completed: searchParams.get("onboarding_completed"),
  });

  useEffect(() => {
    // Check if welcome parameter is present
    const welcomeParam = searchParams.get("welcome");
    const onboardingParam = searchParams.get("onboarding_completed");

    console.log("[DASHBOARD] useEffect triggered");
    console.log("[DASHBOARD] welcomeParam:", welcomeParam);
    console.log("[DASHBOARD] onboardingParam:", onboardingParam);

    if (welcomeParam === "true") {
      console.log("[DASHBOARD] Welcome param detected");

      // Check if banner has already been shown in this session
      const hasShownWelcome = sessionStorage.getItem(WELCOME_SHOWN_KEY);

      console.log("[DASHBOARD] hasShownWelcome:", hasShownWelcome);

      if (!hasShownWelcome) {
        // Show banner and mark as shown
        console.log("[DASHBOARD] Showing welcome banner");
        setShowWelcomeBanner(true);
        sessionStorage.setItem(WELCOME_SHOWN_KEY, "true");
      }

      // Clean URL by removing welcome parameter
      const newUrl = window.location.pathname;
      console.log("[DASHBOARD] Cleaning URL to:", newUrl);
      router.replace(newUrl);
    } else {
      console.log("[DASHBOARD] No welcome param, skipping cleanup");
    }
  }, [searchParams, router]);

  const getUserName = (email?: string) => {
    if (!email) return "Sam";
    return email.split("@")[0];
  };

  const handleDismissBanner = () => {
    setShowWelcomeBanner(false);
  };

  return (
    <div className="flex flex-col gap-8">
      {showWelcomeBanner && (
        <WelcomeBanner onDismiss={handleDismissBanner} />
      )}
      <WelcomeHeader userName={getUserName(user?.email)} />
      <StatsCards />
      <ActivityChart />
      <RecentArticlesList />
    </div>
  );
}

export default function DashboardPage({ params }: DashboardPageProps) {
  void params;

  return (
    <Suspense fallback={<div className="flex flex-col gap-8">Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
