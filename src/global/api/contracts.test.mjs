import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

function moduleUrl(source) {
  const js = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2023, module: ts.ModuleKind.ESNext } }).outputText
  return `data:text/javascript;base64,${Buffer.from(js).toString('base64')}`
}
const clientSource = (await readFile(new URL('./sessionClient.ts', import.meta.url), 'utf8')).replaceAll('import.meta.env', '({ VITE_PROFILE_API_URL: "/backend", VITE_USE_MOCK: "false" })')
const clientUrl = moduleUrl(clientSource)
const client = await import(clientUrl)
async function loadApi(file) {
  const source = await readFile(new URL(file, import.meta.url), 'utf8')
  return import(moduleUrl(source.replaceAll('../../global/api/sessionClient', clientUrl)))
}
const originalFetch = globalThis.fetch
test.afterEach(() => { globalThis.fetch = originalFetch; client.clearAccessToken() })

// 2026-11-16 배포 OpenAPI의 경로·메서드·요청 필드로 검증한다. 실제 서버에는 쓰지 않는다.
const cases = [
  ['../../domain/auth/authApi.ts', 'refreshLogin', [], 'POST', '/auth/refresh', undefined, { accessToken: 'refresh-token' }, false],
  ['../../domain/auth/authApi.ts', 'logout', [], 'POST', '/auth/logout', undefined, null, true],
  ['../../domain/auth/authApi.ts', 'getCsrf', [], 'GET', '/auth/csrf', undefined, { token: 'csrf' }, false],
  ['../../domain/auth/authApi.ts', 'withdrawAccount', ['password!'], 'DELETE', '/auth/account', { password: 'password!' }, null, true],
  ['../../domain/family/familyApi.ts', 'getBabies', [], 'GET', '/babies', undefined, [{ babyId: 1 }], true],
  ['../../domain/family/familyApi.ts', 'createBaby', [{ name: '아기', birthDate: '2025-09-01' }], 'POST', '/babies', { name: '아기', birthDate: '2025-09-01' }, { babyId: 1 }, true],
  ['../../domain/family/familyApi.ts', 'getBaby', [1], 'GET', '/babies/1', undefined, { babyId: 1 }, true],
  ['../../domain/family/familyApi.ts', 'updateBaby', [1, { name: '바비' }], 'PATCH', '/babies/1', { name: '바비' }, { babyId: 1 }, true],
  ['../../domain/family/familyApi.ts', 'getBabyMembers', [1], 'GET', '/babies/1/members', undefined, [], true],
  ['../../domain/family/familyApi.ts', 'sendBabyInvitation', [1, 'parent@example.com'], 'POST', '/babies/1/invitations', { email: 'parent@example.com' }, { babyId: 1 }, true],
  ['../../domain/family/familyApi.ts', 'transferBabyOwnership', [1, 2], 'PATCH', '/babies/1/members/owner', { newOwnerUserId: 2 }, null, true],
  ['../../domain/family/familyApi.ts', 'leaveBabyGroup', [1], 'DELETE', '/babies/1/members/me', undefined, null, true],
  ['../../domain/ai-report/aiReportApi.ts', 'createDailyReport', [1, { reportDate: '2026-11-16', summary: '돌봄 요약' }], 'POST', '/babi/api/babies/1/daily-reports', { reportDate: '2026-11-16', summary: '돌봄 요약' }, { reportId: 1 }, true],
  ['../../domain/ai-report/aiReportApi.ts', 'getDailyReport', [1, '2026-11-16'], 'GET', '/babi/api/babies/1/daily-reports/2026-11-16', undefined, { reportId: 1 }, true],
  ['../../domain/ai-report/aiReportApi.ts', 'updateDailyReport', [1, '2026-11-16', '수정 요약'], 'PATCH', '/babi/api/babies/1/daily-reports/2026-11-16', { summary: '수정 요약' }, { reportId: 1 }, true],
  ['../../domain/ai-report/aiReportApi.ts', 'deleteDailyReport', [1, '2026-11-16'], 'DELETE', '/babi/api/babies/1/daily-reports/2026-11-16', undefined, null, true],
]

for (const [file, name, args, method, path, body, data, auth] of cases) {
  test(`${name}: ${method} ${path}`, async () => {
    const api = await loadApi(file)
    client.setAccessToken('existing-token')
    globalThis.fetch = async (url, options) => {
      if ((name === 'refreshLogin' || name === 'logout') && url === '/backend/auth/csrf') {
        assert.equal(options.headers.get('Authorization'), null)
        return Response.json({ success: true, data: { token: 'csrf' } })
      }
      if (name === 'refreshLogin' || name === 'logout') assert.equal(options.headers.get('X-CSRF-Token'), 'csrf')
      assert.equal(url, '/backend' + path)
      assert.equal(options.method ?? 'GET', method)
      assert.deepEqual(options.body ? JSON.parse(options.body) : undefined, body)
      assert.equal(options.headers.get('Authorization'), auth ? 'Bearer existing-token' : null)
      return Response.json({ success: true, message: '완료', data })
    }
    assert.deepEqual(await api[name](...args), data)
  })
}

test('로그인으로 받은 JWT를 다음 요청에 사용한다', async () => {
  const { rememberLogin } = await loadApi('../../domain/auth/authApi.ts')
  globalThis.fetch = async () => Response.json({ success: true, data: { accessToken: 'new-token' } })
  rememberLogin('new-token', 'parent@example.com')
  globalThis.fetch = async (_url, options) => {
    assert.equal(options.headers.get('Authorization'), 'Bearer new-token')
    return Response.json({ success: true, data: [] })
  }
  await client.request('/babies')
})
