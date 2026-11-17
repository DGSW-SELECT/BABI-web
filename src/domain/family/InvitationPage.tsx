import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router'
import FamilyJoinForm from './FamilyJoinForm'
import FamilyPageHeader from './FamilyPageHeader'
import { useSession } from '../auth/useSession'
import './FamilyAccount.css'

export default function InvitationPage() {
  const { token } = useSession()
  const { search } = useLocation()
  const navigate = useNavigate()
  const code = new URLSearchParams(search).get('code') ?? ''
  useEffect(() => {
    // 메일의 일반 쿼리는 해시 라우트로 옮겼으므로 이후 재방문에 남기지 않는다.
    const url = new URL(window.location.href)
    if (url.searchParams.has('code')) { url.searchParams.delete('code'); url.pathname = import.meta.env.BASE_URL || '/'; window.history.replaceState(window.history.state, '', url) }
  }, [])
  return <main className="mx-auto flex h-dvh max-w-[402px] flex-col overflow-hidden bg-[#f7f8f9] text-[#121212]" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
    <FamilyPageHeader title="육아 그룹 참여" />
    <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-3 pb-8">
    <p className="mt-3 text-sm leading-6 text-[#78848f]">초대 코드를 확인하고 아기 그룹에 참여해주세요. 확인만으로는 그룹에 가입되지 않아요.</p>
    <FamilyJoinForm key={code} token={token} initialCode={code} expanded onJoined={(baby) => navigate(`/family?babyId=${baby.babyId}`, { replace: true })} />
    </div>
  </main>
}
