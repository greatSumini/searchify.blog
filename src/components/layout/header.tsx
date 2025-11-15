"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Sidebar } from "./sidebar";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useTranslations } from 'next-intl';

export function Header() {
  const t = useTranslations();
  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex items-center gap-4">
      </div>

      <div className="flex items-center gap-4">
        <LanguageSwitcher />
        <SignedIn>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-9 w-9",
                userButtonTrigger: "focus:shadow-none",
              },
            }}
            afterSignOutUrl="/sign-in"
          />
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <Button
              variant="default"
              className="h-10 bg-[#3BA2F8] hover:bg-[#2E91E5] px-6 font-semibold"
            >
              {t("common.login")}
            </Button>
          </SignInButton>
        </SignedOut>
      </div>
    </header>
  );
}
