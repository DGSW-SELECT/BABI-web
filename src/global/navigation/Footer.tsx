import { useState, type ReactNode } from "react";

type FooterTab = "홈" | "기록" | "AI" | "캘린더" | "마이페이지";
type IconProps = { filled?: boolean };
const NAV_ICON_COLOR = "#7895bb";

type FooterItemProps = {
  label: string;
  icon: (props: IconProps) => ReactNode;
  active: boolean;
  onClick: () => void;
};

const FooterItem = ({
  label,
  icon,
  active,
  onClick,
}: FooterItemProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-current={active ? "page" : undefined}
    aria-pressed={active}
    className={`flex h-14 min-w-0 flex-1 appearance-none flex-col items-center justify-center gap-1 rounded-2xl border-0 text-[#7895bb] outline-none [-webkit-tap-highlight-color:transparent] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7895bb] ${
      active
        ? "bg-[#eff6ff]"
        : "hover:bg-[#f3f8ff] active:bg-[#e8f3ff]"
    }`}
  >
    {icon({ filled: active })}
    <span className="whitespace-nowrap text-[11px] font-bold leading-none tracking-[-0.08em]">
      {label}
    </span>
  </button>
);

const HomeIcon = ({ filled = false }: IconProps) => (
  <svg
    width="27"
    height="27"
    viewBox="0 0 56 56"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M5.9 25.2 25.1 8.7a4.4 4.4 0 0 1 5.8 0l19.2 16.5c2.5 2.1 1 6.2-2.3 6.2h-2.1v16.4c0 2.3-1.9 4.2-4.2 4.2H34V36.3h-12V52h-7.5a4.2 4.2 0 0 1-4.2-4.2V31.4H8.2c-3.3 0-4.8-4.1-2.3-6.2Z"
      fill={filled ? NAV_ICON_COLOR : "none"}
      stroke={NAV_ICON_COLOR}
      strokeWidth="5.5"
      strokeLinejoin="round"
    />
  </svg>
);

const RecordIcon = ({ filled = false }: IconProps) => (
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
      fill={filled ? NAV_ICON_COLOR : "none"}
      stroke={NAV_ICON_COLOR}
      strokeWidth="6"
    />
    <path
      d="M19 18h18M19 28h18M19 38h12"
      stroke={filled ? "white" : NAV_ICON_COLOR}
      strokeWidth="6"
      strokeLinecap="round"
    />
  </svg>
);

const CalendarIcon = ({ filled = false }: IconProps) => (
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
      fill={filled ? NAV_ICON_COLOR : "none"}
      stroke={NAV_ICON_COLOR}
      strokeWidth="5.5"
    />
    <path
      d="M17 4v10M39 4v10"
      stroke={filled ? "white" : NAV_ICON_COLOR}
      strokeWidth="5.5"
      strokeLinecap="round"
    />
    <path
      d={filled ? "M3.25 21h49.5" : "M6 21h44"}
      stroke={filled ? "white" : NAV_ICON_COLOR}
      strokeWidth="5.5"
      strokeLinecap="butt"
    />
    <circle cx="18" cy="31" r="3" fill={filled ? "white" : NAV_ICON_COLOR} />
    <circle cx="28" cy="31" r="3" fill={filled ? "white" : NAV_ICON_COLOR} />
    <circle cx="38" cy="31" r="3" fill={filled ? "white" : NAV_ICON_COLOR} />
    <circle cx="18" cy="41" r="3" fill={filled ? "white" : NAV_ICON_COLOR} />
    <circle cx="28" cy="41" r="3" fill={filled ? "white" : NAV_ICON_COLOR} />
    <circle cx="38" cy="41" r="3" fill={filled ? "white" : NAV_ICON_COLOR} />
  </svg>
);

const ProfileIcon = ({ filled = false }: IconProps) => (
  <svg
    width="27"
    height="27"
    viewBox="0 0 56 56"
    fill="none"
    aria-hidden="true"
  >
    <circle
      cx="28"
      cy="17"
      r="11"
      fill={filled ? NAV_ICON_COLOR : "none"}
      stroke={NAV_ICON_COLOR}
      strokeWidth="5.5"
    />
    {filled ? (
      <path
        d="M7 49c1.7-11.7 10.5-18 21-18s19.3 6.3 21 18v11H7V49Z"
        fill={NAV_ICON_COLOR}
        stroke={NAV_ICON_COLOR}
        strokeWidth="5.5"
        strokeLinecap="round"
      />
    ) : (
      <path
        d="M7 49c1.7-11.7 10.5-18 21-18s19.3 6.3 21 18"
        stroke={NAV_ICON_COLOR}
        strokeWidth="5.5"
        strokeLinecap="round"
      />
    )}
  </svg>
);

export default function Footer() {
  const [activeTab, setActiveTab] = useState<FooterTab>("홈");

  return (
    <footer className="absolute inset-x-0 bottom-0 z-50 border-t border-[#edf0f3] bg-white px-3 pb-6 pt-1.5">
      <nav
        aria-label="하단 내비게이션"
        className="flex h-14 w-full items-center gap-1"
      >
        <FooterItem
          label="홈"
          active={activeTab === "홈"}
          icon={(props) => <HomeIcon {...props} />}
          onClick={() => setActiveTab("홈")}
        />
        <FooterItem
          label="기록"
          active={activeTab === "기록"}
          icon={(props) => <RecordIcon {...props} />}
          onClick={() => setActiveTab("기록")}
        />

        <button
          type="button"
          aria-label="BABI AI"
          aria-current={activeTab === "AI" ? "page" : undefined}
          aria-pressed={activeTab === "AI"}
          onClick={() => setActiveTab("AI")}
          className={`flex h-14 min-w-0 flex-1 appearance-none items-start justify-center rounded-2xl border-0 pt-[5px] outline-none [-webkit-tap-highlight-color:transparent] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7895bb] ${
            activeTab === "AI"
              ? "bg-[#eff6ff]"
              : "hover:bg-[#f3f8ff] active:bg-[#e8f3ff]"
          }`}
        >
          <img
            src="/babi-logo.png"
            alt=""
            className="h-11 w-11 -translate-y-[7px] object-contain"
          />
        </button>

        <FooterItem
          label="캘린더"
          active={activeTab === "캘린더"}
          icon={(props) => <CalendarIcon {...props} />}
          onClick={() => setActiveTab("캘린더")}
        />
        <FooterItem
          label="마이페이지"
          active={activeTab === "마이페이지"}
          icon={(props) => <ProfileIcon {...props} />}
          onClick={() => setActiveTab("마이페이지")}
        />
      </nav>
    </footer>
  );
}
