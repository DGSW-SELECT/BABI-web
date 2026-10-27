import { useState, type FormEvent } from "react";

export type FamilyMember = {
  id: number;
  name: string;
  email?: string;
  role?: string;
  contact?: string;
  start: string;
  end: string;
};

type Props = { onBack: () => void; onCreate: (member: FamilyMember) => void };

export default function FamilyAccountCreate({ onBack, onCreate }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("18:00");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;
    onCreate({
      id: Date.now(),
      name: name.trim(),
      email: email.trim(),
      start,
      end,
    });
  }

  return (
    <section className="px-[30px] pt-[79px] pb-10">
      <header className="relative flex h-12 items-center justify-center">
        <button
          type="button"
          onClick={onBack}
          aria-label="가족 계정 관리로 돌아가기"
          className="family-back absolute left-0 grid size-11 place-items-center rounded-xl text-2xl hover:bg-white"
        >
          ‹
        </button>
        <h1 className="text-[24px] font-medium text-black">가족 계정 생성</h1>
      </header>
      <div className="mt-10 flex flex-col items-center text-center">
        <img
          src="/family/avatar.png"
          alt="가족 프로필"
          className="size-[72px]"
        />
        <h2 className="mt-5 text-xl font-medium text-[#4a3d3c]">
          함께 돌볼 가족을 추가해요
        </h2>
        <p className="mt-2 text-[13px] text-[#979797]">
          가족의 정보와 돌봄 시간을 입력해주세요.
        </p>
      </div>
      <form onSubmit={submit} className="mt-9 space-y-5">
        <label className="block text-sm text-[#4a3d3c]">
          이름 또는 관계
          <input
            required
            maxLength={20}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 엄마, 아빠, 할머니"
            className="family-input mt-2 w-full"
          />
        </label>
        <label className="block text-sm text-[#4a3d3c]">
          이메일 <span className="text-xs text-[#979797]">(선택)</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일을 입력해주세요"
            className="family-input mt-2 w-full"
          />
        </label>
        <fieldset>
          <legend className="text-sm text-[#4a3d3c]">돌봄 시간</legend>
          <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <input
              aria-label="돌봄 시작 시간"
              type="time"
              required
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="family-input min-w-0 w-full"
            />
            <span className="text-[#979797]">–</span>
            <input
              aria-label="돌봄 종료 시간"
              type="time"
              required
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="family-input min-w-0 w-full"
            />
          </div>
        </fieldset>
        <button
          type="submit"
          className="family-primary mt-5 h-[49px] w-full rounded-[13px] bg-black text-sm text-white hover:bg-[#303030]"
        >
          가족 계정 추가하기
        </button>
      </form>
    </section>
  );
}
