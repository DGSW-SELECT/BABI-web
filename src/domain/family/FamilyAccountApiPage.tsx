import Header from "../../global/navigation/header/Header";
import { useEffect, useState, type FormEvent } from "react";
import FamilyAccountManagement from "./FamilyAccountManagement";
import FamilyJoinForm from "./FamilyJoinForm";
import FamilyInviteModal from "./FamilyInviteModal";
import { createBaby, inviteMember, listBabies, listMembers, login, type Baby, type Member } from "./family-api";
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
      <h1 className="mt-4 text-[clamp(24px,7.46vw,30px)] leading-9 tracking-[-1.2px]">{title}</h1>
      <p className="mt-[11px] text-[15px] leading-[18px] text-[#706d6d]">{description}</p>
    </header>
  );
}

export default function FamilyAccountApiPage() {
  const [token, setToken] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const data = new FormData(event.currentTarget);
    setPending(true);
    setError("");
    try {
      setToken(await login(String(data.get("email")).trim(), String(data.get("password"))));
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setPending(false);
    }
  }

  if (token) return <FamilyMembers token={token} />;
  if (!showLogin) return <FamilyAccountManagement onConnect={() => { setError(""); setShowLogin(true); }} />;

  return (
    <main className="h-full overflow-y-auto bg-[#f8f9fa] pt-[clamp(48px,11dvh,100px)] pb-8 text-black" data-input-scroll-container>
      <FamilyFormHeading title="다시 만나서 반가워요!" description="로그인하고 가족 계정을 관리해보세요" />
      <form className="mx-auto mt-[43px] flex w-[81.1%] flex-col gap-[10px]" onSubmit={signIn}>
        <label className={formLabel}>이메일
          <input className={formInput} name="email" type="email" autoComplete="username" placeholder="이메일을 입력해주세요" required />
        </label>
        <label className={formLabel}>비밀번호
          <input className={formInput} name="password" type="password" autoComplete="current-password" placeholder="비밀번호를 입력해주세요" required />
        </label>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button disabled={pending} className={formButton} type="submit">
          {pending ? "로그인 중…" : "로그인"}
        </button>
        <button type="button" disabled={pending} className="mt-2 self-center text-sm text-[#393838] underline underline-offset-4" onClick={() => setShowLogin(false)}>
          가족계정관리로 돌아가기
        </button>
      </form>
    </main>
  );
}

const roleLabels: Record<string, string> = {
  OWNER: "소유자", GUARDIAN: "보호자", PARENT: "부모", CAREGIVER: "돌봄 보호자", VIEWER: "조회 전용",
};

function FamilyMembers({ token }: { token: string }) {
  const [babies, setBabies] = useState<Baby[] | null>(null);
  const [preferredBabyId, setBabyId] = useState<number | null>(null);
  const selectedBaby = babies?.find((baby) => baby.babyId === preferredBabyId) ?? babies?.[0];
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    listBabies(token, controller.signal).then((items) => {
      if (controller.signal.aborted) return;
      setBabies(items);
      setBabyId(items[0]?.babyId ?? null);
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setError(errorMessage(error));
    });
    return () => controller.abort();
  }, [token, attempt]);

  function selectJoinedBaby(baby: Baby) {
    setBabies((items) => [...(items ?? []).filter((item) => item.babyId !== baby.babyId), baby]);
    setBabyId(baby.babyId);
  }

  if (babies?.length === 0 && !error) {
    return (
      <main className="relative h-full overflow-y-auto bg-[#f8f9fa] pt-[clamp(64px,11dvh,100px)] pb-8 text-black" data-input-scroll-container>
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
          <h1 className="text-center text-[24px] font-medium">가족계정관리</h1>
          {error ? (
            <p role="alert" className="mt-5">{error} <button className="underline" onClick={() => { setError(""); setAttempt((value) => value + 1); }}>다시 시도</button></p>
          ) : <p role="status" className="mt-5">아기 목록을 불러오는 중이에요.</p>}
        </div>
      ) : (
        <BabyMembers
          key={selectedBaby.babyId}
          baby={selectedBaby}
          babies={babies ?? []}
          token={token}
          onBabyChange={setBabyId}
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

function BabyMembers({ baby, babies, token, onBabyChange }: {
  baby: Baby;
  babies: Baby[];
  onBabyChange: (babyId: number) => void;
  token: string;
}) {
  const { babyId } = baby;
  const [members, setMembers] = useState<Member[] | null>(null);
  const [addingMember, setAddingMember] = useState(false);
  const [invited, setInvited] = useState(false);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    listMembers(token, babyId, controller.signal).then((items) => {
      if (!controller.signal.aborted) setMembers(items);
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setError(errorMessage(error));
    });
    return () => controller.abort();
  }, [token, babyId, attempt]);

  return (
    <>
      <Header
        baby={baby}
        babies={babies}
        onBabyChange={onBabyChange}
      />
      <div className="px-[30px]">
        <h1 className="mt-[37px] text-center text-[24px] font-medium leading-[30px] text-black">가족계정관리</h1>
          <button
            type="button"
            onClick={() => setAddingMember(true)}
            className="family-primary mt-[39px] flex h-[49px] w-full items-center justify-center gap-[9px] rounded-[13.4px] border border-[#d7d7d7] bg-black text-[13.5px] text-white hover:bg-[#303030]"
          >
            <img src="/family/add.svg" alt="" />
            육아 멤버 추가하기
          </button>
          {invited && <p role="status" className="mt-4 text-sm">초대 이메일을 보냈어요. 상대가 수락하면 목록에 표시됩니다.</p>}
          {error ? <p role="alert" className="mt-5">{error} <button className="underline" onClick={() => { setError(""); setAttempt((value) => value + 1); }}>다시 시도</button></p>
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
                  aria-label={`${member.nickname}에게 메시지 보내기`}
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
      {addingMember && (
        <FamilyInviteModal
          token={token}
          babyId={babyId}
          onClose={() => setAddingMember(false)}
          onInvite={async (email) => {
            await inviteMember(token, babyId, email);
            setAddingMember(false);
            setInvited(true);
          }}
        />
      )}
    </>
  );
}
