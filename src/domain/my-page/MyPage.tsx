import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { logout, withdrawAccount } from '../auth/authApi'
import { transferBabyOwnership, leaveBabyGroup } from '../family/familyApi'
import FamilyInviteModal from '../family/FamilyInviteModal'
import '../family/FamilyAccount.css'
import { Link } from 'react-router'
import Modal from '../../shared/components/Modal'
import { getBabyAge, getToday } from './myPageData'
import type { BabyProfileInput, MyPageData } from './myPageData'
import type { BabyInput } from '../family/familyApi'

type MyPageProps = {
  data: MyPageData | null
  userId: number | null
  email: string
  loading: boolean
  error: string
  onRetry: () => void
  onSaveBaby: (input: BabyProfileInput) => Promise<void>
  onCreateBaby: (input: BabyInput) => Promise<void>
  onGroupChanged: (left?: boolean) => void
}
type MyPageDialog = { type: 'baby' | 'create' | 'invite' } | { type: 'member'; userId: number } | { type: 'transfer' | 'leave' | 'withdraw' }
const inputClass = 'mt-2 min-h-11 w-full min-w-0 rounded-xl border border-[#d6d6d6] bg-white px-3 py-2 text-base text-[#121212] outline-none placeholder:text-[#92979d] focus:border-[#7895bb] focus:ring-1 focus:ring-[#7895bb]'
const smallButtonClass = 'flex min-h-10 cursor-pointer items-center gap-1.5 rounded-lg px-1.5 text-xs font-medium text-[#6687ad] focus-visible:outline-2 focus-visible:outline-[#7895bb]'

export default function MyPage({ data, userId, email, loading, error, onRetry, onSaveBaby, onCreateBaby, onGroupChanged }: MyPageProps) {
  const accountBusy = useRef(false)
  const [accountPending, setAccountPending] = useState(false)
  const [accountError, setAccountError] = useState('')
  const [dialog, setDialog] = useState<MyPageDialog | null>(null)
  const [message, setMessage] = useState('')
  const profile = data?.members.find((member) => member.userId === userId)
  const owner = data?.members.find((member) => member.userId === data.ownerId)
  const isAdmin = userId !== null && data?.ownerId === userId
  const member = dialog?.type === 'member' ? data?.members.find((item) => item.userId === dialog.userId) : undefined

  async function saveBaby(input: BabyProfileInput) {
    await onSaveBaby(input)
    setDialog(null)
    setMessage('아기 정보를 저장했어요.')
  }

  async function addBaby(input: BabyInput) {
    await onCreateBaby(input)
    setDialog(null)
  }

  async function signOut() {
    if (accountBusy.current) return
    accountBusy.current = true
    setAccountPending(true)
    setAccountError('')
    try { await logout() }
    catch (error) { setAccountError(error instanceof Error ? error.message : '로그아웃하지 못했어요.') }
    finally { accountBusy.current = false; setAccountPending(false) }
  }

  return (
    <main aria-label="마이페이지" className="page-content-start flex h-full min-h-0 flex-col bg-[#f7f8f9] text-[#121212]">
      <section aria-label="내 프로필" className="shrink-0 px-5 max-[360px]:px-4">
        <div className="rounded-[17px] border border-[#d6d6d6] bg-white p-4">
          <div className="flex items-center gap-3.5">
            <Avatar name={profile?.name ?? '나'} photoUrl="" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-lg font-semibold">{profile?.name ?? (userId !== null ? '내 계정' : '로그인이 필요해요')}</h2>
                {profile && <RoleBadge admin={isAdmin} />}
              </div>
              <p className="mt-1 truncate text-xs text-[#8b9298]">{email || '로그인 이메일 정보가 없어요.'}</p>
            </div>
          </div>
        </div>
      </section>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-6 pb-8 max-[360px]:px-4">
        {loading ? <p role="status" className="py-8 text-center text-sm text-[#78848f]">아기와 멤버 정보를 불러오는 중…</p>
          : error ? <div className="space-y-3 rounded-[17px] border border-[#d6d6d6] bg-white p-4">
            <p role="alert" className="text-sm text-red-700">{error}</p>
            {userId === null ? <Link to="/login" className={smallButtonClass}>로그인하기</Link> : <button type="button" onClick={onRetry} className={smallButtonClass}>다시 불러오기</button>}
          </div>
          : data ? <>
            {message && <p role="status" className="mb-6 rounded-xl bg-[#edf4fb] px-3 py-2 text-xs leading-5 text-[#587797]">{message}</p>}
            <section aria-labelledby="my-baby-title">
              <div className="mb-2 flex min-h-10 items-center justify-between gap-2">
                <h2 id="my-baby-title" className="text-base font-semibold">우리 아기</h2>
                {isAdmin ? <button type="button" aria-label="아기 정보 수정" onClick={() => setDialog({ type: 'baby' })} className={smallButtonClass}>정보 수정 <EditIcon /></button>
                  : <span className="flex items-center gap-1 text-[11px] text-[#92979d]"><LockIcon /> 조회 전용</span>}
              </div>
              <button type="button" disabled={!isAdmin} aria-label={`${data.baby.name} 아기 정보 수정`} onClick={() => setDialog({ type: 'baby' })}
                className="block w-full rounded-[17px] border border-[#d6e4f1] bg-[#eff5fb] px-4 pt-4 pb-3 text-left enabled:cursor-pointer enabled:hover:bg-[#e6f0f9] focus-visible:outline-2 focus-visible:outline-[#7895bb]">
                <div className="flex items-center gap-3.5">
                  <Avatar name={data.baby.name} photoUrl={data.baby.photoUrl ?? ''} baby />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-lg font-semibold">{data.baby.name}</h3>
                    <p className="mt-1 text-[13px] text-[#6687a5]">{getBabyAge(data.baby.birthDate)}</p>
                    <p className="mt-1 text-xs text-[#8b9298]">{data.baby.birthDate.replaceAll('-', '. ')} 출생</p>
                  </div>
                </div>
                <p className="mt-3 border-t border-[#dce7f1] pt-2.5 text-[11px] text-[#7d8e9e]">그룹 관리자 · {owner?.name ?? '확인 필요'}</p>
              </button>
            </section>
            <section aria-labelledby="group-members-title" className="mt-6">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 id="group-members-title" className="flex items-center gap-2 text-base font-semibold">함께 돌보는 멤버 <span className="text-sm font-normal text-[#7895bb]">{data.members.length}</span></h2>
                <span className="text-[11px] text-[#92979d]">멤버 정보 조회</span>
              </div>
              <ul className="divide-y divide-[#eef0f2] overflow-hidden rounded-[17px] border border-[#d6d6d6] bg-white">
                {data.members.map((item) => <li key={item.userId}>
                  <button type="button" onClick={() => setDialog({ type: 'member', userId: item.userId })} aria-label={`${item.name} 멤버 정보 조회`}
                    className="flex min-h-[82px] w-full cursor-pointer items-center gap-3 px-4 py-3 text-left hover:bg-[#f9fbfd] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#7895bb]">
                    <Avatar name={item.name} photoUrl="" small />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h3 className="truncate text-sm font-medium">{item.name}</h3>
                        {item.userId === userId && <span className="text-[10px] text-[#92979d]">나</span>}
                        {item.userId === data.ownerId && <RoleBadge admin />}
                      </div>
                      <p className="mt-1 text-xs text-[#8b9298]">{item.userId === data.ownerId ? '관리자' : '멤버'}</p>
                    </div>
                    <span className="shrink-0 text-[#98a7b5]"><ChevronIcon /></span>
                  </button>
                </li>)}
              </ul>
              {isAdmin && <button type="button" onClick={() => setDialog({ type: 'invite' })}
                className="mt-3 flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#7895bb] bg-white text-sm font-semibold text-[#6687ad] hover:bg-[#edf4fc] focus-visible:outline-2 focus-visible:outline-[#7895bb]">
                <span aria-hidden="true" className="text-xl leading-none">+</span> 멤버 추가
              </button>}
            </section>
          </> : <div className="space-y-4 rounded-[17px] border border-[#d6d6d6] bg-white p-5 text-center">
            <p className="font-medium">등록된 아기가 없어요.</p>
            <p className="text-sm text-[#8b9298]">아기를 등록하면 함께 돌보는 멤버를 관리할 수 있어요.</p>
            <button type="button" onClick={() => setDialog({ type: 'create' })} className="min-h-11 w-full rounded-xl bg-[#121212] text-sm text-white">아기 등록</button>
          </div>}
        <section aria-label="계정과 그룹 관리" className="mt-6 space-y-3 border-t border-[#e5e9ed] pt-5 text-sm">
          <Link to="/invite" className="block rounded-xl border border-[#d6d6d6] bg-white px-4 py-3">초대 코드로 다른 그룹 참여</Link>
          {data && <Link to="/family/manage" className="block rounded-xl border border-[#d6d6d6] bg-white px-4 py-3">가족 계정 관리</Link>}
          {isAdmin && data && data.members.length > 1 && <button type="button" className={smallButtonClass} onClick={() => setDialog({ type: 'transfer' })}>관리자 이전</button>}
          {data && !isAdmin && <button type="button" className={smallButtonClass} onClick={() => setDialog({ type: 'leave' })}>그룹 나가기</button>}
          <button type="button" className={smallButtonClass} disabled={accountPending} onClick={signOut}>{accountPending ? '로그아웃 중…' : '로그아웃'}</button>
          {accountError && <p role="alert" className="text-xs text-red-700">{accountError}</p>}
          <button type="button" className="min-h-10 text-xs text-[#92979d] underline" onClick={() => setDialog({ type: 'withdraw' })}>회원 탈퇴</button>
        </section>
      </div>
      {(dialog?.type === 'transfer' || dialog?.type === 'leave' || dialog?.type === 'withdraw') && <AccountActionDialog action={dialog.type} data={data} userId={userId} onClose={() => setDialog(null)} onChanged={(left) => { setDialog(null); onGroupChanged(left) }} />}
      {dialog?.type === 'invite' && isAdmin && data && <FamilyInviteModal onClose={() => setDialog(null)} />}
      {dialog?.type === 'baby' && data && isAdmin && <BabyDialog baby={data.baby} onClose={() => setDialog(null)} onSave={saveBaby} />}
      {dialog?.type === 'create' && <BabyDialog onClose={() => setDialog(null)} onSave={addBaby} />}
      {member && data && <Modal title="멤버 정보" subtitle={member.userId === data.ownerId ? '관리자' : '멤버'} onClose={() => setDialog(null)}>
        <div className="mb-5 flex items-center gap-3"><Avatar name={member.name} photoUrl="" /><p className="text-base font-medium">{member.name}</p></div>
        <dl className="space-y-4 text-sm">
          <InfoRow label="이메일" value={member.email || '미등록'} />
          <InfoRow label="관계·돌봄 시간" value="미등록" />
        </dl>
      </Modal>}
    </main>
  )
}

function BabyDialog({ baby, onClose, onSave }: { baby?: BabyProfileInput; onClose: () => void; onSave: (input: BabyProfileInput) => Promise<void> }) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const busy = useRef(false)
  const photoBusy = useRef(false)
  const [photoPending, setPhotoPending] = useState(false)
  const [photoUrl, setPhotoUrl] = useState(baby?.photoUrl ?? '')
  const photoInput = useRef<HTMLInputElement>(null)

  async function selectPhoto(file?: File) {
    if (!file || photoBusy.current) return
    photoBusy.current = true
    setPhotoPending(true)
    setError('')
    try { setPhotoUrl(await readBabyPhoto(file)) }
    catch { setError('사진을 열지 못했어요. JPG·PNG 등 다른 이미지로 선택해주세요.') }
    finally {
      photoBusy.current = false
      setPhotoPending(false)
      if (photoInput.current) photoInput.current.value = ''
    }
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy.current || photoBusy.current) return
    const form = new FormData(event.currentTarget)
    const name = String(form.get('name') ?? '').trim()
    const birthDate = String(form.get('birthDate') ?? '')
    if (!name || getBabyAge(birthDate) === '생일을 확인해주세요') { setError('이름과 올바른 생년월일을 입력해주세요.'); return }
    busy.current = true
    setPending(true)
    setError('')
    try { await onSave({ name, birthDate, ...(baby ? { photoUrl } : {}) }) }
    catch (error) { setError(error instanceof Error ? error.message : '아기 정보를 저장하지 못했어요.') }
    finally { busy.current = false; setPending(false) }
  }
  function close() { if (!busy.current && !photoBusy.current) onClose() }
  return <Modal title={baby ? '아기 정보 수정' : '아기 등록'} subtitle="이름과 생년월일을 입력해주세요." onClose={close}>
    <form onSubmit={save} className="space-y-4">
      <fieldset disabled={pending || photoPending} className="space-y-4">
        {baby && <div className="flex flex-col items-center gap-3 pb-2">
          <button type="button" aria-label="아기 프로필 사진 변경" onClick={() => photoInput.current?.click()}
            className="relative cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-[#7895bb]">
            <Avatar name={baby.name} photoUrl={photoUrl} baby />
            <span className="absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-full border border-[#d6e4f1] bg-white text-[#6687ad]"><EditIcon /></span>
          </button>
          <input ref={photoInput} type="file" accept="image/*" aria-label="아기 프로필 사진 선택" className="sr-only" onChange={(event) => void selectPhoto(event.target.files?.[0])} />
          <div className="flex items-center gap-4 text-xs text-[#6687ad]">
            <button type="button" onClick={() => photoInput.current?.click()}>{photoPending ? '사진을 불러오는 중…' : '사진 변경'}</button>
            {photoUrl && <button type="button" onClick={() => setPhotoUrl('')}>사진 삭제</button>}
          </div>
        </div>}

        <label className="block text-sm font-medium">아기 이름<input name="name" required maxLength={50} defaultValue={baby?.name ?? ''} className={inputClass} /></label>
        <label className="block text-sm font-medium">생년월일<input name="birthDate" required type="date" max={getToday()} defaultValue={baby?.birthDate ?? ''} className={inputClass} /></label>
      </fieldset>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <div className="flex gap-2 border-t border-[#eef0f2] pt-3">
        <button type="button" onClick={close} disabled={pending || photoPending} className="min-h-11 flex-1 rounded-xl border border-[#d6d6d6] text-sm">취소</button>
        <button type="submit" disabled={pending || photoPending} className="min-h-11 flex-1 rounded-xl bg-[#121212] text-sm text-white disabled:opacity-50">{pending ? '저장 중…' : baby ? '저장' : '등록'}</button>
      </div>
    </form>
  </Modal>
}

function AccountActionDialog({ action, data, userId, onClose, onChanged }: { action: 'transfer' | 'leave' | 'withdraw'; data: MyPageData | null; userId: number | null; onClose: () => void; onChanged: (left?: boolean) => void }) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [nextOwner, setNextOwner] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const busy = useRef(false)
  const title = action === 'transfer' ? '관리자 이전' : action === 'leave' ? '그룹 나가기' : '회원 탈퇴'
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy.current) return
    if (action === 'transfer' && !confirmed) { setConfirmed(true); return }
    busy.current = true
    setPending(true)
    setError('')
    try {
      if (action === 'withdraw') {
        const form = new FormData(event.currentTarget)
        await withdrawAccount(String(form.get('password') ?? ''))
      } else if (data && action === 'transfer') {
        const id = Number(nextOwner)
        if (!data.members.some((member) => member.userId === id && id !== userId)) throw new Error('새 관리자를 선택해주세요.')
        await transferBabyOwnership(data.baby.babyId, id)
      } else if (data) await leaveBabyGroup(data.baby.babyId)
      onChanged(action === 'leave')
    } catch (error) { setError(error instanceof Error ? error.message : '요청을 처리하지 못했어요.') }
    finally { busy.current = false; setPending(false) }
  }
  return <Modal title={title} onClose={() => { if (!busy.current) onClose() }}>
    <form onSubmit={submit} className="space-y-4">
      <fieldset disabled={pending} className="space-y-4">
        {action === 'transfer' ? <>
          <label className="block text-sm">새 관리자<select required aria-label="새 관리자" className={inputClass} value={nextOwner} onChange={(event) => { setNextOwner(event.target.value); setConfirmed(false) }}>
            <option value="">멤버를 선택해주세요</option>{data?.members.filter((member) => member.userId !== userId).map((member) => <option key={member.userId} value={member.userId}>{member.name}</option>)}
          </select></label>
          {confirmed && <p className="text-sm leading-6">이전하면 나는 일반 멤버 권한으로 변경됩니다. 계속할까요?</p>}
        </> : action === 'leave' ? <p className="text-sm leading-6">{data?.baby.name} 그룹에서 나가면 이 아기의 기록을 더 이상 볼 수 없어요. 다시 참여하려면 초대가 필요해요.</p> : <>
          <p className="text-sm leading-6">계정이 삭제되고 그룹 권한을 잃어요. 관리 중인 그룹이 있다면 먼저 관리자 권한을 이전해주세요.</p>
          <label className="block text-sm">현재 비밀번호<input className={inputClass} name="password" type="password" autoComplete="current-password" maxLength={20} required /></label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" required />탈퇴 안내를 확인했어요</label>
        </>}
      </fieldset>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <div className="flex gap-2">
        <button type="button" disabled={pending} onClick={onClose} className="min-h-11 flex-1 rounded-xl border border-[#d6d6d6] text-sm">취소</button>
        <button disabled={pending} type="submit" className="min-h-11 flex-1 rounded-xl bg-[#121212] px-2 text-sm text-white disabled:opacity-50">{pending ? '처리 중…' : action === 'transfer' ? confirmed ? '이전 확인' : '관리자 권한 이전하기' : action === 'leave' ? '그룹에서 나가기' : '계정 영구 탈퇴'}</button>
      </div>
    </form>
  </Modal>
}

function Avatar({ name, photoUrl, baby = false, small = false }: { name: string; photoUrl: string; baby?: boolean; small?: boolean }) {
  return <span aria-hidden="true" className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full ${small ? 'size-10 text-sm' : 'size-14 text-xl'} ${baby ? 'bg-white' : 'bg-[#edf3fa] text-[#7895bb]'}`}>
    {photoUrl ? <img src={photoUrl} alt="" className="h-full w-full object-cover" /> : baby ? <img src="/ai-report-mascot.svg" alt="" className="h-12 w-11 object-contain" /> : name.trim().slice(0, 1)}
  </span>
}

function RoleBadge({ admin }: { admin: boolean }) {
  return <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] leading-4 font-medium ${admin ? 'bg-[#edf4fc] text-[#6687ad]' : 'bg-[#f1f2f4] text-[#8b9298]'}`}>{admin ? '관리자' : '멤버'}</span>
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-3"><dt className="text-[#92979d]">{label}</dt><dd className="break-all">{value}</dd></div>
}

function EditIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14 5 5 5M4 20l5-1L20 8a3.5 3.5 0 0 0-5-5L4 14Z" /></svg>
}

function ChevronIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>
}

function LockIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
}

async function readBabyPhoto(file: File) {
  if (!file.type.startsWith('image/')) throw new Error('이미지 파일을 선택해주세요.')
  const image = await createImageBitmap(file)
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const context = canvas.getContext('2d')
    if (!context) throw new Error('사진을 처리하지 못했어요.')
    context.fillStyle = '#fff'
    context.fillRect(0, 0, 512, 512)
    const size = Math.min(image.width, image.height)
    context.drawImage(image, (image.width - size) / 2, (image.height - size) / 2, size, size, 0, 0, 512, 512)
    return canvas.toDataURL('image/jpeg', 0.85)
  } finally { image.close() }
}
