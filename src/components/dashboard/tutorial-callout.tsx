"use client";

import * as React from "react";
import { ChevronRight, X } from "lucide-react";

type TutorialCalloutProps = {
  anchorKey: string;
  currentStep: number;
  description: string;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  title: string;
  totalSteps: number;
};

type AnchorRect = {
  height: number;
  left: number;
  top: number;
  width: number;
};

function getAnchorElement(anchorKey: string) {
  return document.querySelector<HTMLElement>(
    `[data-tutorial-anchor="${anchorKey}"]`,
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

export function TutorialCallout({
  anchorKey,
  currentStep,
  description,
  isOpen,
  onClose,
  onNext,
  title,
  totalSteps,
}: TutorialCalloutProps) {
  const [anchorRect, setAnchorRect] = React.useState<AnchorRect | null>(null);

  const measureAnchor = React.useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    const anchorElement = getAnchorElement(anchorKey);

    if (!anchorElement) {
      setAnchorRect(null);
      return;
    }

    const nextRect = anchorElement.getBoundingClientRect();

    setAnchorRect({
      height: nextRect.height,
      left: nextRect.left,
      top: nextRect.top,
      width: nextRect.width,
    });
  }, [anchorKey]);

  React.useEffect(() => {
    if (!isOpen || typeof window === "undefined") {
      setAnchorRect(null);
      return;
    }

    const frame = window.requestAnimationFrame(measureAnchor);

    const handleResize = () => {
      measureAnchor();
    };

    const handleScroll = () => {
      measureAnchor();
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, true);

    let resizeObserver: ResizeObserver | null = null;
    const anchorElement = getAnchorElement(anchorKey);

    if (anchorElement && "ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(() => {
        measureAnchor();
      });
      resizeObserver.observe(anchorElement);
    }

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll, true);
      resizeObserver?.disconnect();
    };
  }, [anchorKey, isOpen, measureAnchor]);

  React.useEffect(() => {
    if (!isOpen || typeof window === "undefined") {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !anchorRect) {
    return null;
  }

  const bubbleWidth = 320;
  const viewportWidth =
    typeof window !== "undefined" ? window.innerWidth : bubbleWidth + 24;
  const left = clamp(
    anchorRect.left + anchorRect.width / 2 - bubbleWidth / 2,
    12,
    Math.max(12, viewportWidth - bubbleWidth - 12),
  );
  const top = anchorRect.top + anchorRect.height + 14;

  return (
    <div className="pointer-events-none fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-slate-950/18" />

      <div
        className="pointer-events-auto fixed"
        style={{
          left,
          top,
          width: `min(${bubbleWidth}px, calc(100vw - 24px))`,
        }}
      >
        <div className="relative rounded-[1.35rem] border border-slate-200 bg-white px-4 pb-4 pt-4 text-slate-900 shadow-[0_20px_50px_rgba(15,23,42,0.26)]">
          <div className="absolute -top-2 left-8 h-4 w-4 rotate-45 border-l border-t border-slate-200 bg-white" />

          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">
                Tutorial {currentStep + 1}/{totalSteps}
              </p>
              <h3 className="mt-2 text-base font-semibold text-slate-900">
                {title}
              </h3>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
              aria-label="Close tutorial"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="text-sm leading-6 text-slate-600">{description}</p>

          <div className="mt-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="text-sm font-semibold text-slate-500 transition hover:text-slate-900"
            >
              Close
            </button>

            <button
              type="button"
              onClick={onNext}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              {currentStep + 1 === totalSteps ? "Done" : "Next"}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
