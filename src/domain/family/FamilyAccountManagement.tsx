import Header from "../../global/navigation/header/Header";
import { useState } from "react";
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

function ChatIcon({ first = false }: { first?: boolean }) {
  return (
    <span className="relative block h-[21.78px] w-[25.2px]" aria-hidden="true">
      <img src={first ? "/family/chat.svg" : "/family/member-chat.svg"} alt="" />
      <img src={first ? "/family/chat-tail.svg" : "/family/member-chat-tail.svg"} alt="" className="absolute left-[13.86px] top-[15px]" />
      <span className="absolute left-[5px] top-[-5px] text-[17px] tracking-[1px] text-white">···</span>
    </span>
  );
}

export default function FamilyAccountManagement({ onConnect }: { onConnect?: () => void } = {}) {
  const [creating, setCreating] = useState(false);
  const [members, setMembers] = useState(initialMembers);
  const [addingMember, setAddingMember] = useState(false);

  return (
    <div data-input-scroll-container className="family-view relative h-full w-full overflow-y-auto bg-[#f8f9fa] pb-6">
      {creating ? (
        <FamilyAccountCreate
          onBack={() => setCreating(false)}
          onCreate={(member) => {
            setMembers((current) => [...current, member]);
            setCreating(false);
          }}
        />
      ) : (
        <main>
          <Header baby={{ babyId: 1, name: "지민이" }} />
          <div className="px-[30px]">
          <h1 className="mt-[37px] text-center text-[24px] font-medium leading-[30px] text-black">
            가족계정관리
          </h1>
          <button
            type="button"
            onClick={onConnect ?? (() => setAddingMember(true))}
            className="family-primary mt-[39px] flex h-[49px] w-full items-center justify-center gap-[9px] rounded-[13.4px] border border-[#d7d7d7] bg-black text-[13.5px] text-white hover:bg-[#303030]"
          >
            <img src="/family/add.svg" alt="" />
            육아 멤버 추가하기
          </button>
          {onConnect && (
            <p className="mt-3 text-sm text-[#706d6d]">
              예시 화면이에요. <button type="button" className="underline underline-offset-2" onClick={onConnect}>로그인</button>하면 실제 보호자 목록을 볼 수 있어요.
            </p>
          )}
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
                  data-keep-footer-visible
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
          </div>
        </main>
      )}
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
