import { twMerge } from 'tailwind-merge';

const Logo = ({ className = "", markClassName = "", wordClassName = "" }) => (
  <div className={twMerge("inline-flex items-center gap-2", className)}>
    <span
      className={twMerge(
        "grid place-items-center w-7 h-7 rounded-sm bg-accent text-accent-ink shrink-0",
        markClassName
      )}
      aria-hidden="true"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className="w-4 h-4">
        <path d="M2.5 8.5 6 12l7.5-8" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="square" />
      </svg>
    </span>
    <span className={twMerge("font-display font-semibold italic text-lg tracking-tight", wordClassName)}>YallaDo</span>
  </div>
);

export default Logo;
