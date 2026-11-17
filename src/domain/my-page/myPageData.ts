import type { Baby, BabyInput, BabyMember } from '../family/familyApi'

export type MyPageMember = {
  userId: number
  name: string
  email: string
}
export type BabyProfileInput = BabyInput & { photoUrl?: string }
export type MyPageBaby = Baby & { photoUrl?: string }
export type MyPageData = { ownerId: number | null; baby: MyPageBaby; members: MyPageMember[] }

// 서버가 주지 않는 정보는 예시 값으로 채우지 않는다.
export function mapMyPageData(baby: MyPageBaby, members: BabyMember[], userId: number, email: string): MyPageData {
  return {
    ownerId: members.find((member) => member.role === 'OWNER')?.userId ?? null,
    baby,
    members: members.map((member) => ({
      userId: member.userId, name: member.nickname,
      email: member.userId === userId ? email : '',
    })),
  }
}

export function getToday() {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
}

export function getBabyAge(birthDate: string, today = getToday()) {
  if (!birthDate || birthDate > today) return '생일을 확인해주세요'
  const birth = new Date(`${birthDate}T00:00:00Z`)
  const now = new Date(`${today}T00:00:00Z`)
  if (Number.isNaN(birth.getTime()) || birth.toISOString().slice(0, 10) !== birthDate) return '생일을 확인해주세요'
  let months = (now.getUTCFullYear() - birth.getUTCFullYear()) * 12 + now.getUTCMonth() - birth.getUTCMonth()
  if (now.getUTCDate() < birth.getUTCDate()) months -= 1
  if (months > 0) return `생후 ${months}개월`
  return `생후 ${Math.floor((now.getTime() - birth.getTime()) / 86400000)}일`
}


// 사진 업로드 API가 제공되기 전까지 계정·아기별로 이 브라우저에 보관한다.
export function getBabyPhoto(userId: number, babyId: number) {
  try { return localStorage.getItem(`babi-baby-photo-${userId}-${babyId}`) ?? '' }
  catch { return '' }
}

export function saveBabyPhoto(userId: number, babyId: number, photoUrl: string) {
  try {
    const key = `babi-baby-photo-${userId}-${babyId}`
    if (photoUrl) localStorage.setItem(key, photoUrl)
    else localStorage.removeItem(key)
  } catch {
    throw new Error('아기 정보는 반영했지만 사진을 이 브라우저에 저장하지 못했어요. 저장 공간을 확인해주세요.')
  }
}
