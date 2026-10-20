import { useEffect, useRef, useState, type FormEvent } from "react";
import type { FamilyMember } from "./FamilyAccountCreate";

const roles = ["베이비시터", "조부모", "부모", "사촌", "기타"];

type Props = { onClose: () => void; onAdd: (member: FamilyMember) => void };

export default function FamilyMemberModal({ onClose, onAdd }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState(roles[0]);
  const [contact, setContact] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog?.showModal();
    return () => {
      dialog?.close();
      document.body.style.overflow = overflow;
    };
  }, []);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !contact.trim()) return;
    onAdd({ id: Date.now(), name: name.trim(), role, contact: contact.trim(), start: "", end: "" });
  }

  return (
    <dialog ref={dialogRef} onCancel={(event) => { event.preventDefault(); onClose(); }} aria-labelledby="family-member-title" className="family-member-dialog">
      <button type="button" aria-label="팝업 닫기" onClick={onClose} className="absolute inset-0 h-full w-full cursor-default bg-black/60" tabIndex={-1} />
      <section className="family-member-sheet relative z-10 w-full rounded-t-[44px] bg-white px-[38px] pt-[34px] pb-[max(55px,env(safe-area-inset-bottom))] text-black max-[360px]:px-7">
        <header className="flex items-center justify-between">
          <h2 id="family-member-title" className="text-[22px] font-semibold leading-7">육아 멤버 추가하기</h2>
          <button autoFocus type="button" onClick={onClose} aria-label="닫기" className="-mr-2 grid size-8 place-items-center rounded-lg text-[24px] font-normal hover:bg-gray-100">×</button>
        </header>
        <form onSubmit={submit} className="mt-[31px]">
          <label className="block text-[13px] leading-[18px]">이름
            <input required maxLength={20} value={name} onChange={(event) => setName(event.target.value)} placeholder="이름을 입력해주세요" className="family-input mt-1 w-full" />
          </label>
          <fieldset className="mt-[15px]">
            <legend className="text-[13px] leading-[18px]">역할</legend>
            <div className="mt-[7px] flex flex-wrap gap-[9px]">
              {roles.map((item) => <button key={item} type="button" aria-pressed={role === item} onClick={() => setRole(item)} className={`h-10 rounded-[14px] border px-[12px] text-[12px] transition-colors ${role === item ? "border-[#5fa8ff] bg-[#eaf2ff] text-[#5fa8ff]" : "border-transparent bg-[#d9d9d9] text-[#888888] hover:bg-[#cccccc]"}`}>{item}</button>)}
            </div>
          </fieldset>
          <label className="mt-[15px] block text-[13px] leading-[18px]">연락처
            <input required value={contact} onChange={(event) => setContact(event.target.value)} placeholder="전화번호 또는 이메일을 입력해주세요" className="family-input mt-1 w-full" />
          </label>
          <button type="submit" className="family-primary mt-[10px] h-[54px] w-full rounded-[10px] bg-[#111111] text-[15px] text-white hover:bg-[#303030]">추가하기</button>
        </form>
        <button type="button" className="mt-[31px] flex h-[49px] w-full items-center justify-center gap-[9px] rounded-[14px] border border-[#e1dfe5] bg-[#f6f3fc] text-[12px] text-[#222222] hover:bg-[#eee8f7]">
          <span aria-hidden="true" className="text-lg">↗</span>
          초대 링크로 간편하게 추가하기
          <span aria-hidden="true" className="ml-4 text-[24px] leading-none">›</span>
        </button>
      </section>
    </dialog>
  );
}
