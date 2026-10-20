import type { ReactNode } from "react";

type FooterItemProps = {
  label: string;
  icon: ReactNode;
  active?: boolean;
};

const FooterItem = ({ label, icon, active = false }: FooterItemProps) => (
  <a
    aria-current={active ? "page" : undefined}
    className={`flex h-14 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl text-[#7895bb] transition-colors ${
      active ? "bg-[#eff6ff]" : "active:bg-[#f7faff]"
    }`}
  >
    {icon}
    <span className="whitespace-nowrap text-[11px] font-bold leading-none tracking-[-0.08em]">
      {label}
    </span>
  </a>
);

const HomeIcon = () => (
  <svg
    width="27"
    height="27"
    viewBox="0 0 56 56"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M5.9 25.2 25.1 8.7a4.4 4.4 0 0 1 5.8 0l19.2 16.5c2.5 2.1 1 6.2-2.3 6.2h-2.1v16.4c0 2.3-1.9 4.2-4.2 4.2H34V36.3h-12V52h-7.5a4.2 4.2 0 0 1-4.2-4.2V31.4H8.2c-3.3 0-4.8-4.1-2.3-6.2Z"
      fill="currentColor"
    />
  </svg>
);

const RecordIcon = () => (
  <svg
    width="27"
    height="27"
    viewBox="0 0 56 56"
    fill="none"
    aria-hidden="true"
  >
    <rect
      x="7"
      y="3"
      width="42"
      height="50"
      rx="10"
      stroke="currentColor"
      strokeWidth="6"
    />
    <path
      d="M19 18h18M19 28h18M19 38h12"
      stroke="currentColor"
      strokeWidth="6"
      strokeLinecap="round"
    />
  </svg>
);

const CalendarIcon = () => (
  <svg
    width="27"
    height="27"
    viewBox="0 0 56 56"
    fill="none"
    aria-hidden="true"
  >
    <rect
      x="6"
      y="8"
      width="44"
      height="42"
      rx="10"
      stroke="currentColor"
      strokeWidth="5.5"
    />
    <path
      d="M17 4v10M39 4v10M6 21h44"
      stroke="currentColor"
      strokeWidth="5.5"
      strokeLinecap="round"
    />
    <circle cx="18" cy="31" r="3" fill="currentColor" />
    <circle cx="28" cy="31" r="3" fill="currentColor" />
    <circle cx="38" cy="31" r="3" fill="currentColor" />
    <circle cx="18" cy="41" r="3" fill="currentColor" />
    <circle cx="28" cy="41" r="3" fill="currentColor" />
    <circle cx="38" cy="41" r="3" fill="currentColor" />
  </svg>
);

const ProfileIcon = () => (
  <svg
    width="27"
    height="27"
    viewBox="0 0 56 56"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="28" cy="17" r="11" stroke="currentColor" strokeWidth="5.5" />
    <path
      d="M7 49c1.7-11.7 10.5-18 21-18s19.3 6.3 21 18"
      stroke="currentColor"
      strokeWidth="5.5"
      strokeLinecap="round"
    />
  </svg>
);

export default function Footer() {
  return (
    <footer className="absolute inset-x-0 bottom-0 z-50 border-t border-[#edf0f3] bg-white px-3 pb-6 pt-1.5">
      <nav
        aria-label="하단 내비게이션"
        className="flex h-14 w-full items-center gap-1"
      >
        <FooterItem label="홈" active icon={<HomeIcon />} />
        <FooterItem label="기록" icon={<RecordIcon />} />

        <img
          src="/babi-logo.png"
          alt="BABI"
          className="h-11 w-11 object-contain"
        />

        <FooterItem label="캘린더" icon={<CalendarIcon />} />
        <FooterItem label="마이페이지" icon={<ProfileIcon />} />
      </nav>
    </footer>
  );
}
