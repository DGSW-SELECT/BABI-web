import { useState } from "react";
import Footer from "../../global/navigation/Footer";
import FamilyAccountCreate, { type FamilyMember } from "./FamilyAccountCreate";
import FamilyMemberModal from "./FamilyMemberModal";
import "./FamilyAccount.css";

const initialMembers: FamilyMember[] = [
  { id: 1, name: "엄마", start: "18:00", end: "21:00" },
  { id: 2, name: "아빠", start: "13:00", end: "18:00" },
  { id: 3, name: "할머니", start: "9:00", end: "13:00" },
];
const colors = [
  { borderColor: "#5fa8e8", backgroundColor: "#5fa8e81a" },
  { borderColor: "#a88be8", backgroundColor: "#a88be81a" },
  { borderColor: "#72c58a", backgroundColor: "#72c58a1a" },
];

function ChatIcon({
  header = false,
  first = false,
}: {
  header?: boolean;
  first?: boolean;
}) {
  return (
    <span
      className={
        header
          ? "relative block size-[36.3px]"
          : "relative block h-[21.78px] w-[25.2px]"
      }
      aria-hidden="true"
    >
      {header && (
        <img
          src="/family/chat-circle.svg"
          alt=""
          className="absolute left-0 top-0"
        />
      )}
      <span
        className={
          header
            ? "absolute left-[6.26px] top-[9.09px]"
            : "absolute left-0 top-0"
        }
      >
        <img
          src={
            header
              ? "/family/header-chat.svg"
              : first
                ? "/family/chat.svg"
                : "/family/member-chat.svg"
          }
          alt=""
        />
        <img
          src={
            header
              ? "/family/header-chat-tail.svg"
              : first
                ? "/family/chat-tail.svg"
                : "/family/member-chat-tail.svg"
          }
          alt=""
          className={
            header
              ? "absolute left-[12.96px] top-[13.77px]"
              : "absolute left-[13.86px] top-[15px]"
          }
        />
        <span
          className={`absolute left-[5px] top-[-5px] tracking-[1px] ${header ? "text-[15px] text-[#a6b1b5]" : "text-[17px] text-white"}`}
        >
          ···
        </span>
      </span>
    </span>
  );
}

export default function FamilyAccountManagement() {
  const [creating, setCreating] = useState(false);
  const [members, setMembers] = useState(initialMembers);
  const [addingMember, setAddingMember] = useState(false);

  return (
    <div className="family-view relative mx-auto min-h-[max(874px,100svh)] w-full max-w-[402px] bg-[#f8f9fa] pb-[112px] shadow-[0_0_24px_rgba(0,0,0,0.08)]">
      {creating ? (
        <FamilyAccountCreate
          onBack={() => setCreating(false)}
          onCreate={(member) => {
            setMembers((current) => [...current, member]);
            setCreating(false);
          }}
        />
      ) : (
        <main className="px-[30px] pt-[79px]">
          <header className="flex h-12 items-center justify-between gap-2">
            <button
              type="button"
              aria-label="선택된 아이: 지민이"
              className="flex h-12 w-[150px] min-w-0 items-center gap-[7px] rounded-[14px] bg-white pl-[10px] pr-3"
            >
              <img
                src="/family/avatar.png"
                alt=""
                className="size-[36.3px] shrink-0"
              />
              <span className="flex-1 text-left text-[15px] text-[#4a3d3c]">
                지민이
              </span>
              <span
                className="size-[10px] -translate-y-0.5 rotate-45 border-b-2 border-r-2 border-[#252525]"
                aria-hidden="true"
              />
            </button>
            <div className="flex items-center gap-[6px]">
              <button type="button" aria-label="채팅" className="rounded-full">
                <ChatIcon header />
              </button>
              <button type="button" aria-label="알림" className="rounded-full">
                <img src="/family/alarm.svg" alt="" />
              </button>
              <button
                type="button"
                aria-label="프로필"
                className="rounded-full"
              >
                <img
                  src="/family/avatar.png"
                  alt=""
                  className="size-[36.3px]"
                />
              </button>
            </div>
          </header>
          <h1 className="mt-[37px] text-center text-[24px] font-medium leading-[30px] text-black">
            가족계정관리
          </h1>
          <button
            type="button"
            onClick={() => setAddingMember(true)}
            className="family-primary mt-[39px] flex h-[49px] w-full items-center justify-center gap-[9px] rounded-[13.4px] border border-[#d7d7d7] bg-black text-[13.5px] text-white hover:bg-[#303030]"
          >
            <img src="/family/add.svg" alt="" />
            육아 멤버 추가하기
          </button>
          <ul className="mt-5 space-y-[15px]" aria-label="가족 돌봄 일정">
            {members.map((member, index) => (
              <li
                key={member.id}
                style={colors[index % colors.length]}
                className="flex h-[72px] items-center gap-6 rounded-[13.4px] border px-5"
              >
                <img
                  src="/family/avatar.png"
                  alt=""
                  className="size-[58.5px] shrink-0"
                />
                <div className="min-w-0 flex-1 tracking-[-0.58px]">
                  <h2 className="truncate text-[21.6px] leading-[28.34px] text-[#4a3d3c]">
                    {member.name}
                  </h2>
                  <p className="whitespace-nowrap text-[18px] leading-[28.34px] text-[#979797] max-[360px]:text-[15px]">
                    {member.start && member.end
                      ? `${member.start} - ${member.end}`
                      : member.role}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label={`${member.name}에게 메시지 보내기`}
                  className="shrink-0 rounded"
                >
                  <ChatIcon first={index === 0} />
                </button>
              </li>
            ))}
          </ul>
          <section className="relative mt-[50px] flex h-[145px] items-center overflow-hidden rounded-[13.4px] border border-[#d7d7d7] bg-white pl-5 pr-3">
            <div className="relative z-10 min-w-0 flex-1">
              <h2 className="whitespace-nowrap text-[14.4px] tracking-[-0.63px] text-black max-[360px]:text-[12px]">
                가족들에게 격려의 메시지를 전해요!
              </h2>
              <div className="mt-[13px] flex h-[49px] items-center rounded-[9px] border border-[#a7b1b5] bg-[#f8f9fa] pl-2 pr-3">
                <input
                  aria-label="가족에게 전할 메시지"
                  placeholder="메시지를 입력하세요."
                  className="min-w-0 flex-1 bg-transparent text-[11px] text-[#4a3d3c] outline-none placeholder:text-[#c1c1c1]"
                />
                <button
                  type="button"
                  aria-label="메시지 전송"
                  className="ml-2 grid size-7 shrink-0 place-items-center"
                >
                  <img src="/family/send.svg" alt="" />
                </button>
              </div>
            </div>
            <img
              src="/family/mascot.png"
              alt="BABI 캐릭터"
              className="ml-[10px] h-[110px] w-[100px] shrink-0 object-cover max-[360px]:ml-1 max-[360px]:w-[78px] max-[360px]:object-contain"
            />
          </section>
        </main>
      )}
      <Footer />
      {addingMember && (
        <FamilyMemberModal
          onClose={() => setAddingMember(false)}
          onAdd={(member) => {
            setMembers((current) => [...current, member]);
            setAddingMember(false);
          }}
        />
      )}
    </div>
  );
}
