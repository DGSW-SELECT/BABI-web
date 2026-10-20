import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";
import profileChip from "../assets/header/profile-chip.png";
import chatBtn from "../assets/header/chat.png";
import alarmBtn from "../assets/header/alarm.png";
import profileBtn from "../assets/header/profile.png";

/**
 * 공통 레이아웃: 폰 화면 프레임 안에 상태바 / 헤더 / 본문 / 하단 푸터.
 * (모바일 실제 기기에서는 프레임 없이 화면 전체를 사용)
 */
export default function PageLayout() {
  return (
    <div className="babi-stage">
      <div className="babi-phone">
        <div className="babi-status" aria-hidden="true">
          <span>9:41</span>
          <span className="babi-status__icons">
            <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="1" /><rect x="5" y="5" width="3" height="7" rx="1" /><rect x="10" y="2.5" width="3" height="9.5" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" /></svg>
            <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor"><path d="M8 2.2c2.3 0 4.4.9 6 2.4l1.1-1.2A10.4 10.4 0 0 0 8 .5C5.2.5 2.7 1.6.9 3.4L2 4.6a8.6 8.6 0 0 1 6-2.4zm0 3.4c1.4 0 2.700.5 3.700 1.4l1.100-1.200A7 7 0 0 0 8 3.900a7 7 0 0 0-4.800 1.900l1.100 1.200c1-.9 2.300-1.400 3.700-1.400zM8 9a2 2 0 0 1 1.300.5L8 11 6.700 9.500A2 2 0 0 1 8 9z" /></svg>
            <svg width="26" height="12" viewBox="0 0 26 12" fill="none"><rect x=".5" y=".5" width="22" height="11" rx="3.500" stroke="currentColor" opacity=".4" /><rect x="2" y="2" width="19" height="8" rx="2" fill="currentColor" /><rect x="24" y="4" width="1.500" height="4" rx=".7" fill="currentColor" opacity=".4" /></svg>
          </span>
        </div>

        <header className="babi-top">
          <button className="babi-imgbtn" aria-label="아기 선택">
            <img src={profileChip} width={150} height={48} alt="지민이" />
          </button>
          <div className="babi-icons">
            <button className="babi-imgbtn" aria-label="채팅"><img src={chatBtn} width={37} height={37} alt="" /></button>
            <button className="babi-imgbtn" aria-label="알림"><img src={alarmBtn} width={37} height={37} alt="" /></button>
            <button className="babi-imgbtn" aria-label="프로필"><img src={profileBtn} width={37} height={37} alt="" /></button>
          </div>
        </header>

        <main className="babi-main">
          <Outlet />
        </main>

        <BottomNav />
        <div className="babi-home-indicator" aria-hidden="true" />
      </div>
    </div>
  );
}
