"use client";

import * as React from "react";
import { GraduationCap } from "lucide-react";

const communityPhotos = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80",
] as const;

type AuthShellProps = {
  cardIcon?: React.ReactNode;
  children: React.ReactNode;
  eyebrow: string;
  heroDescription: string;
  heroImageAlt: string;
  heroImageUrl: string;
  heroTitle: string;
  mobileTitle: string;
  title: string;
};

export function AuthShell({
  cardIcon,
  children,
  eyebrow,
  heroDescription,
  heroImageAlt,
  heroImageUrl,
  heroTitle,
  mobileTitle,
  title,
}: AuthShellProps) {
  return (
    <div className="app-scroll-shell relative min-h-screen w-full overflow-hidden bg-[#060816]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.2),_transparent_58%)]" />
        <div className="absolute bottom-0 left-[-10%] h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute right-[-10%] top-24 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 grid min-h-screen w-full overflow-hidden bg-white/5 backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden min-h-screen flex-col justify-between overflow-hidden border-r border-white/10 bg-slate-950/60 p-12 lg:flex">
          <img
            src={heroImageUrl}
            alt={heroImageAlt}
            className="absolute inset-0 h-full w-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.32),rgba(2,6,23,0.88))]" />
          <div className="relative z-10 flex items-center gap-3 text-white">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/15 ring-1 ring-inset ring-cyan-300/40">
              <GraduationCap className="h-6 w-6 text-cyan-200" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/80">
                Academic OS
              </p>
              <p className="text-sm text-slate-200/80">
                A calmer command center for school.
              </p>
            </div>
          </div>

          <div className="relative z-10 max-w-md">
            <p className="mb-5 text-sm uppercase tracking-[0.3em] text-cyan-200/75">
              {eyebrow}
            </p>
            <h1 className="text-5xl font-semibold leading-tight text-white">
              {heroTitle}
            </h1>
            <p className="mt-6 text-base leading-7 text-slate-200/80">
              {heroDescription}
            </p>
          </div>

          <div className="relative z-10 flex items-center justify-between rounded-3xl border border-white/10 bg-slate-950/35 p-5">
            <div>
              <p className="text-sm text-slate-300">
                Students already organizing smarter
              </p>
              <p className="mt-2 text-3xl font-semibold text-white">12,000+</p>
            </div>
            <div className="flex">
              {communityPhotos.map((photo, index) => (
                <img
                  key={photo}
                  src={photo}
                  alt="Community member"
                  className={`h-12 w-12 rounded-full border-2 border-slate-950 object-cover ${
                    index > 0 ? "-ml-3" : ""
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="relative flex min-h-screen items-center justify-center px-6 py-10 sm:px-10 lg:px-16">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/15 ring-1 ring-inset ring-cyan-300/40">
                <GraduationCap className="h-7 w-7 text-cyan-200" />
              </div>
              <p className="text-sm uppercase tracking-[0.28em] text-cyan-200/80">
                Academic OS
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-white">
                {mobileTitle}
              </h1>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/14 to-white/5 p-8 shadow-2xl">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-cyan-200/75">
                    {eyebrow}
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold text-white">
                    {title}
                  </h2>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                  {cardIcon ?? <GraduationCap className="h-6 w-6 text-white" />}
                </div>
              </div>

              {children}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
