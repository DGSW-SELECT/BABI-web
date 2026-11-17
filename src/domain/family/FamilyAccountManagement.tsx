import { getCurrentUserId } from "../../global/api/sessionClient";
import { Link } from "react-router";
import FamilyPageHeader from "./FamilyPageHeader";
import { useEffect, useState, type FormEvent } from "react";
import FamilyJoinForm from "./FamilyJoinForm";
import FamilyInviteModal from "./FamilyInviteModal";
import { createBaby, listBabies, listMembers, type Baby, type Member } from "./family-api";
import "./FamilyAccount.css";

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

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "다시 시도해주세요.";
}

const formLabel = "flex flex-col gap-[10px] text-[13px] leading-4";
const formInput = "h-[54px] w-full min-w-0 rounded-[10px] border border-[#bbbaba] bg-white px-5 text-[15px] outline-none placeholder:text-[#868282] focus:border-[#7895bb] focus:ring-1 focus:ring-[#7895bb]";
const formButton = "mt-5 h-14 w-full rounded-[10px] bg-[#111] text-[18px] text-white transition-colors hover:bg-[#292929] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7895bb] disabled:opacity-60";

function FamilyFormHeading({ title, description }: { title: string; description: string }) {
  return (
    <header className="text-center">
      <div className="relative h-[60px]">
        <span className="auth-wordmark text-[50.4px] leading-[60px]">babi</span>
        <img src="/auth/mascot.png" width="79" height="87" alt="" className="absolute top-[-23px] left-[65.42%] h-[87px] w-[79px] object-cover" />
      </div>
      <h2 className="mt-4 text-[clamp(24px,7.46vw,30px)] leading-9 tracking-[-1.2px]">{title}</h2>
      <p className="mt-[11px] text-[15px] leading-[18px] text-[#706d6d]">{description}</p>
    </header>
  );
}

const roleLabels: Record<string, string> = {
  OWNER: "소유자", GUARDIAN: "보호자", PARENT: "부모", CAREGIVER: "돌봄 보호자", VIEWER: "조회 전용",
};

export default function FamilyAccountManagement({ token, selectedBabyId, onBabyChange }: { token: string; selectedBabyId?: number; onBabyChange?: (id: number) => void }) {
  return (
    <section className="flex h-full min-h-0 flex-col bg-[#f8f9fa]" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
      <FamilyPageHeader title="가족계정관리" />
      <div className="min-h-0 flex-1">
        {token ? (
          <ConnectedFamily token={token} selectedBabyId={selectedBabyId} onBabyChange={onBabyChange} />
        ) : (
          <main className="family-view h-full overflow-y-auto bg-[#f8f9fa] pb-6" data-input-scroll-container>
            <BabyMembers token="" />
          </main>
        )}
      </div>
    </section>
  );
}

function ConnectedFamily({ token, selectedBabyId, onBabyChange }: { token: string; selectedBabyId?: number; onBabyChange?: (id: number) => void }) {
  const [babies, setBabies] = useState<Baby[] | null>(null);
  const [preferredBabyId, setBabyId] = useState<number | null>(null);
  const selectedBaby = babies?.find((baby) => baby.babyId === (selectedBabyId ?? preferredBabyId)) ?? babies?.[0];
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    listBabies(token, controller.signal).then((items) => {
      if (controller.signal.aborted) return;
      setBabies(items);
      setBabyId((previous) => previous ?? (items.some((item) => item.babyId === selectedBabyId) ? selectedBabyId! : items[0]?.babyId ?? null));
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setError(errorMessage(error));
    });
    return () => controller.abort();
  }, [token, attempt, selectedBabyId]);

  function selectJoinedBaby(baby: Baby) {
    setBabies((items) => [...(items ?? []).filter((item) => item.babyId !== baby.babyId), baby]);
    setBabyId(baby.babyId);
    onBabyChange?.(baby.babyId);
  }

  if (babies?.length === 0 && !error) {
    return (
      <main className="relative h-full overflow-y-auto bg-[#f8f9fa] pt-8 pb-8 text-black" data-input-scroll-container>
        <FamilyFormHeading title="우리아이와 함께 시작해요" description="아기 정보를 입력하고 가족 계정을 시작해보세요" />
        <BabyRegistration token={token} onRegistered={selectJoinedBaby} />
        <div className="mx-auto w-[81.1%]">
          <FamilyJoinForm token={token} onJoined={selectJoinedBaby} />
        </div>
      </main>
    );
  }

  return (
    <main className="family-view h-full overflow-y-auto bg-[#f8f9fa] pb-6" data-input-scroll-container>
      {error || !selectedBaby ? (
        <div className="px-[30px] pt-8">
          {error ? (
            <p role="alert" className="mt-5">{error} <button className="underline" onClick={() => { setError(""); setAttempt((value) => value + 1); }}>다시 시도</button></p>
          ) : <p role="status" className="mt-5">아기 목록을 불러오는 중이에요.</p>}
        </div>
      ) : (
        <BabyMembers
          key={selectedBaby.babyId}
          baby={selectedBaby}
          token={token}
        />
      )}
    </main>
  );
}

function BabyRegistration({ token, onRegistered }: { token: string; onRegistered: (baby: Baby) => void }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const birthDate = String(data.get("birthDate") ?? "");
    if (!name || !birthDate) {
      setError("아기 이름과 생년월일을 입력해주세요.");
      return;
    }
    setError("");
    setPending(true);
    try {
      onRegistered(await createBaby(token, name, birthDate));
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="mx-auto mt-[39px] flex w-[81.1%] flex-col gap-[10px]" onSubmit={submit}>
      <label className={formLabel}>아기 이름
        <input className={formInput} name="name" placeholder="아기 이름을 입력해주세요" required maxLength={50} />
      </label>
      <label className={formLabel}>생년월일
        <input className={formInput} name="birthDate" type="date" required />
      </label>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <button className={formButton} disabled={pending} type="submit">
        {pending ? "등록 중…" : "아기 등록"}
      </button>
    </form>
  );
}

function BabyMembers({ baby, token }: {
  baby?: Baby;
  token: string;
}) {
  const babyId = baby?.babyId;
  const [members, setMembers] = useState<Member[] | null>(null);
  const [addingMember, setAddingMember] = useState(false);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    if (!token || babyId === undefined) return;
    listMembers(token, babyId, controller.signal).then((items) => {
      if (!controller.signal.aborted) setMembers(items);
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setError(errorMessage(error));
    });
    return () => controller.abort();
  }, [token, babyId, attempt]);

  return (
    <>
      <div className="px-[30px]">
          {token && members?.some((member) => member.userId === getCurrentUserId() && member.role === "OWNER") ? (
          <button
            type="button"
            onClick={() => setAddingMember(true)}
            className="family-primary mt-[39px] flex h-[49px] w-full items-center justify-center gap-[9px] rounded-[13.4px] border border-[#d7d7d7] bg-black text-[13.5px] text-white hover:bg-[#303030]"
          >
            <img src="/family/add.svg" alt="" />
            육아 멤버 추가하기
          </button>
          ) : !token ? (
            <Link to="/login" state={{ fromFamily: true }} className="mt-4 flex h-[49px] items-center justify-center gap-[9px] rounded-[13.4px] border border-[#d7d7d7] bg-black text-[13.5px] text-white">
              <img src="/family/add.svg" alt="" />
              로그인하고 육아 멤버 추가하기
            </Link>
          ) : null}
          {!token ? <p className="mt-5 rounded-[13px] border border-[#d7d7d7] bg-white p-4 text-sm text-[#706d6d]">로그인하면 보호자 목록을 볼 수 있어요.</p>
            : error ? <p role="alert" className="mt-5">{error} <button className="underline" onClick={() => { setError(""); setAttempt((value) => value + 1); }}>다시 시도</button></p>
            : members === null ? <p role="status" className="mt-5">보호자 목록을 불러오는 중이에요.</p>
            : members.length === 0 && <p className="mt-5">표시할 보호자가 없어요.</p>}
          <ul className="mt-5 space-y-[15px]" aria-label="보호자 목록">
            {members?.map((member, index) => (
              <li
                key={member.userId}
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
                    {member.nickname}
                  </h2>
                  <p className="whitespace-nowrap text-[18px] leading-[28.34px] text-[#979797] max-[360px]:text-[15px]">
                    {roleLabels[member.role] ?? member.role}
                  </p>
                </div>
                <button
                  type="button"
                  disabled aria-label={`${member.nickname}에게 메시지 보내기`}
                  className="shrink-0 rounded"
                >
                  <ChatIcon first={index === 0} />
                </button>
              </li>
            ))}
          </ul>
          <section className="relative mt-[50px] flex h-[145px] items-center overflow-hidden rounded-[13.4px] border border-[#d7d7d7] bg-white pl-5 pr-3">
            <div className="relative z-10 min-w-0 flex-1">
              <h2 className="text-[14.4px] tracking-[-0.63px] text-black max-[360px]:text-[12px]">
                가족들에게 격려의 메시지를 전해요!
              </h2>
              <div className="mt-[13px] flex h-[49px] items-center rounded-[9px] border border-[#a7b1b5] bg-[#f8f9fa] pl-2 pr-3">
                <input
                  data-keep-footer-visible
                  aria-label="가족에게 전할 메시지"
                  disabled placeholder="메시지를 입력하세요."
                  className="min-w-0 flex-1 bg-transparent text-[11px] text-[#4a3d3c] outline-none placeholder:text-[#c1c1c1]"
                />
                <button
                  type="button"
                  disabled aria-label="메시지 전송"
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
      {addingMember && babyId !== undefined && members?.some((member) => member.userId === getCurrentUserId() && member.role === "OWNER") && (
        <FamilyInviteModal
          onClose={() => setAddingMember(false)}
        />
      )}
    </>
  );
}
