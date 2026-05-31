"use client";

export function getAcademicTermLabel(date = new Date()) {
  const month = date.getMonth();
  const year = date.getFullYear();

  if (month <= 4) {
    return `Spring ${year}`;
  }

  if (month <= 7) {
    return `Summer ${year}`;
  }

  return `Fall ${year}`;
}

export function getDisplayName(fullName?: string, email?: string) {
  const trimmedName = fullName?.trim();

  if (trimmedName) {
    return trimmedName;
  }

  if (!email) {
    return "Scholar";
  }

  return email
    .split("@")[0]
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getFirstName(displayName: string) {
  return displayName.trim().split(/\s+/)[0] ?? displayName;
}

export function getInitials(displayName: string) {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "SC";
  }

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function getGreeting(date = new Date()) {
  const hour = date.getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 18) {
    return "Good afternoon";
  }

  return "Good evening";
}

export function formatLongDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    weekday: "long",
  }).format(date);
}

export function formatMonthLabel(date = new Date()) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}
