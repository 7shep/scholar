type ScholarMarkProps = {
  className?: string;
  iconClassName?: string;
};

export function ScholarMark({
  className = "rounded-2xl bg-[#0BA13C] p-2 text-white shadow-sm",
  iconClassName = "h-5 w-5",
}: ScholarMarkProps) {
  return (
    <div className={className} aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={iconClassName}
      >
        <path d="M12 7v14" />
        <path d="M3 18.5V6.8c0-.6.3-1.2.8-1.5 1-.7 2.3-1 3.7-1 1.7 0 3.4.5 4.5 1.4 1.1-.9 2.8-1.4 4.5-1.4 1.4 0 2.7.3 3.7 1 .5.3.8.9.8 1.5v11.7c0 .7-.7 1.2-1.4 1-.9-.3-1.9-.4-3-.4-1.9 0-3.8.6-5.1 1.7-1.3-1.1-3.2-1.7-5.1-1.7-1.1 0-2.1.1-3 .4-.7.2-1.4-.3-1.4-1Z" />
      </svg>
    </div>
  );
}
