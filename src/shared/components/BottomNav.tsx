import { NavLink } from "react-router-dom";
import homeImg from "../assets/nav/home.png";
import recordImg from "../assets/nav/record.png";
import mascotImg from "../assets/nav/mascot.png";
import calendarImg from "../assets/nav/calendar.png";
import myImg from "../assets/nav/my.png";

interface Tab {
  key: string;
  alt: string;
  img: string;
  to?: string; // 없으면 아직 연결할 페이지가 없는 탭(비활성)
}

// 탭 ↔ 페이지 연결은 여기만 수정하면 됩니다.
const TABS: Tab[] = [
  { key: "home", alt: "홈", img: homeImg, to: "/voice-record" },
  { key: "record", alt: "기록", img: recordImg, to: "/care-record" },
  { key: "ai", alt: "코끼리", img: mascotImg },
  { key: "calendar", alt: "캘린더", img: calendarImg },
  { key: "my", alt: "마이페이지", img: myImg },
];

/** 하단 푸터 네비게이션 (Figma BottomNavBar 이미지 사용) */
export default function BottomNav() {
  return (
    <nav className="babi-nav" aria-label="하단 메뉴">
      <ul>
        {TABS.map((t) => (
          <li key={t.key}>
            {t.to ? (
              <NavLink to={t.to} className={({ isActive }) => (isActive ? "is-cur" : "")}>
                <img src={t.img} width={60} height={50} alt={t.alt} />
              </NavLink>
            ) : (
              <a aria-disabled="true" className={t.key === "ai" ? "is-static" : "is-disabled"}>
                <img src={t.img} width={60} height={50} alt={t.alt} />
              </a>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
