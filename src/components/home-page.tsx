"use client";

import { CourseGrades } from "@/components/dashboard/course-grades";
import {
  getDisplayName,
} from "@/components/dashboard/dashboard-utils";
import { FocusCard } from "@/components/dashboard/focus-card";
import { MiniCalendar } from "@/components/dashboard/mini-calendar";
import { Sidebar } from "@/components/dashboard/sidebar";
import { StatsRow } from "@/components/dashboard/stats-row";
import { TopBar } from "@/components/dashboard/top-bar";
import { UpNextPanel } from "@/components/dashboard/up-next-panel";

type HomePageProps = {
  email?: string;
  fullName?: string;
  isSigningOut: boolean;
  onSignOut: () => Promise<void> | void;
};

export function HomePage({
  email,
  fullName,
  isSigningOut,
  onSignOut,
}: HomePageProps) {
  const displayName = getDisplayName(fullName, email);

  return (
    <main className="min-h-screen bg-[#FAFAFA] text-slate-900 selection:bg-[#CCFF00] selection:text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col lg:flex-row">
        <Sidebar
          displayName={displayName}
          email={email}
          isSigningOut={isSigningOut}
          onSignOut={onSignOut}
        />

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <TopBar displayName={displayName} />

          <div className="flex-1 px-4 pb-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
              <StatsRow />

              <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
                <div className="flex flex-col gap-6 xl:col-span-7">
                  <UpNextPanel />
                  <FocusCard />
                </div>

                <div className="flex flex-col gap-6 xl:col-span-5">
                  <MiniCalendar />
                  <CourseGrades />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
