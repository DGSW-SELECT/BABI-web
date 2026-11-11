import { useEffect, useRef, useState, type FormEvent } from "react";

import { getInvitationCode, reissueInvitationCode } from "./family-api";

type Props = {
  token: string;
  babyId: number;
  onClose: () => void;
  onInvite: (email: string) => Promise<void>;
};

const roles = ["베이비시터", "조부모", "부모", "사촌", "기타"];

export default function FamilyInviteModal({ token, babyId, onClose, onInvite }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [code, setCode] = useState("");
  const [selectedRole, setSelectedRole] = useState(roles[0]);
  const [confirmReissue, setConfirmReissue] = useState(false);
  const [copied, setCopied] = useState(false);

  async function loadCode(reissue: boolean) {
    if (pending) return "";
    setPending(true);
    setError("");
    try {
      const result = await (reissue ? reissueInvitationCode(token, babyId) : getInvitationCode(token, babyId));
      setCode(result.code);
      return result.code;
    } catch (error) {
      setError(error instanceof Error ? error.message : "초대 코드를 불러오지 못했어요.");
      return "";
    } finally {
      setConfirmReissue(false);
      setPending(false);
    }
  }

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = new FormData(event.currentTarget);
    const email = String(form.get("contact") ?? "").trim();
    if (!email) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("현재 초대 API는 이메일 주소만 지원해요.");
      return;
    }

    setError("");
    setPending(true);
    try {
      await onInvite(email);
    } catch (error) {
      setError(error instanceof Error ? error.message : "초대에 실패했어요.");
    } finally {
      setPending(false);
    }
  }

  async function copyInvitationLink() {
    const invitationCode = code || await loadCode(false);
    if (!invitationCode) return;
    const link = `${window.location.origin}${window.location.pathname}#/family?code=${encodeURIComponent(invitationCode)}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setError("");
    } catch {
      setError("링크를 복사하지 못했어요. 초대 코드를 확인해주세요.");
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onCancel={(event) => {
        event.preventDefault();
        if (!pending) onClose();
      }}
      aria-labelledby="family-member-title"
      className="family-member-dialog"
    >
      <button
        type="button"
        aria-label="팝업 닫기"
        onClick={onClose}
        disabled={pending}
        className="family-member-backdrop"
        tabIndex={-1}
      />
      <section className="family-member-sheet" aria-label="육아 멤버 추가">
        <header className="family-member-heading">
          <h2 id="family-member-title">육아 멤버 추가하기</h2>
          <button type="button" onClick={onClose} disabled={pending} aria-label="닫기" className="family-member-close">
            <span />
            <span />
          </button>
        </header>

        <form onSubmit={submit} className="family-member-form">
          <label className="family-member-field">
            <span>이름</span>
            <input name="name" type="text" placeholder="이름을 입력해주세요" autoComplete="name" />
          </label>

          <fieldset className="family-member-field family-member-role-field">
            <legend>역할</legend>
            <div className="family-member-roles">
              {roles.map((role) => (
                <button
                  key={role}
                  type="button"
                  aria-pressed={selectedRole === role}
                  className={selectedRole === role ? "family-member-role is-selected" : "family-member-role"}
                  onClick={() => setSelectedRole(role)}
                >
                  {role}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="family-member-field family-member-contact">
            <span>연락처</span>
            <input
              name="contact"
              type="text"
              required
              maxLength={320}
              placeholder="전화번호 또는 이메일을 입력해주세요"
              autoComplete="email"
              inputMode="email"
            />
          </label>

          {error && <p role="alert" className="family-member-error">{error}</p>}
          <button type="submit" disabled={pending} className="family-member-submit">
            {pending ? "추가 중…" : "추가하기"}
          </button>
        </form>

        <button
          type="button"
          disabled={pending}
          onClick={() => void copyInvitationLink()}
          className="family-member-link"
        >
          <img src="/family/invitation-link.svg" alt="" />
          <span>{copied ? "초대 링크를 복사했어요" : "초대 링크로 간편하게 추가하기"}</span>
          <img className="family-member-link-arrow" src="/family/invitation-chevron.svg" alt="" />
        </button>

        {code && (
          <div className="family-member-code">
            <p role="status">초대 코드: <strong className="select-all tracking-widest">{code}</strong></p>
            <button type="button" disabled={pending} onClick={() => setConfirmReissue(true)}>초대 코드 재발급</button>
          </div>
        )}
        {confirmReissue && (
          <div className="family-member-reissue">
            <p>재발급하면 기존 코드는 사용할 수 없어요.</p>
            <button type="button" disabled={pending} onClick={() => void loadCode(true)}>재발급하기</button>
            <button type="button" disabled={pending} onClick={() => setConfirmReissue(false)}>취소</button>
          </div>
        )}

        <div className="family-member-home-indicator" aria-hidden="true" />
      </section>
    </dialog>
  );
}
