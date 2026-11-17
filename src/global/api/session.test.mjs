import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'
function moduleUrl(source) {
  return 'data:text/javascript;base64,' + Buffer.from(ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2023, module: ts.ModuleKind.ESNext } }).outputText).toString('base64')
}
const url = moduleUrl((await readFile(new URL('./sessionClient.ts', import.meta.url), 'utf8')).replaceAll('import.meta.env', '({ VITE_PROFILE_API_URL: "/backend", VITE_USE_MOCK: "false" })'))
const client = await import(url)
const auth = await import(moduleUrl((await readFile(new URL('../../domain/auth/authApi.ts', import.meta.url), 'utf8')).replaceAll('../../global/api/sessionClient', url)))
const originalFetch = globalThis.fetch
const ok = data => Response.json({ success: true, data })
const denied = () => Response.json({ success: false, message: '인증이 필요해요.', error: { code: 'UNAUTHORIZED' } }, { status: 401 })
test.afterEach(() => { globalThis.fetch = originalFetch; client.clearAccessToken() })

test('세션 복구는 쿠키 CSRF 토큰으로 refresh하고 기존 Bearer를 보내지 않는다', async () => {
  client.setAccessToken('expired')
  const calls = []
  globalThis.fetch = async (url, init) => {
    calls.push(url)
    assert.equal(init.headers.get('Authorization'), null)
    if (url.endsWith('/csrf')) return ok({ token: 'signed-csrf' })
    assert.equal(init.headers.get('X-CSRF-Token'), 'signed-csrf')
    return ok({ accessToken: 'restored' })
  }
  await auth.refreshLogin()
  assert.deepEqual(calls, ['/backend/auth/csrf', '/backend/auth/refresh'])
})

test('동시에 만료된 요청들은 한 번만 갱신한 후 새 토큰으로 재요청한다', async () => {
  client.setAccessToken('old')
  let refreshes = 0
  globalThis.fetch = async (url, init) => {
    if (url.endsWith('/csrf')) return ok({ token: 'csrf' })
    if (url.endsWith('/refresh')) { refreshes++; await new Promise(resolve => setTimeout(resolve, 10)); return ok({ accessToken: 'new' }) }
    return init.headers.get('Authorization') === 'Bearer new' ? ok([url]) : denied()
  }
  const result = await Promise.all([client.request('/babies'), client.request('/babies/1/members')])
  assert.equal(result.length, 2)
  assert.equal(refreshes, 1)
})

test('갱신 후에도 401이면 반복하지 않고 세션을 비운다', async () => {
  client.setAccessToken('old')
  let refreshes = 0
  globalThis.fetch = async url => {
    if (url.endsWith('/csrf')) return ok({ token: 'csrf' })
    if (url.endsWith('/refresh')) { refreshes++; return ok({ accessToken: 'new' }) }
    return denied()
  }
  await assert.rejects(client.request('/babies'), error => error.status === 401)
  assert.equal(refreshes, 1)
  assert.equal(client.getCurrentUserId(), null)
})


test('네트워크 오류로 로그아웃 실패하면 기존 세션을 유지한다', async () => {
  const token = 'e30.' + Buffer.from('{"sub":"417"}').toString('base64url') + '.sig'
  client.setAccessToken(token)
  globalThis.fetch = async url => {
    if (url.endsWith('/csrf')) return ok({ token: 'csrf' })
    throw new TypeError('offline')
  }
  await assert.rejects(auth.logout())
  assert.equal(client.getCurrentUserId(), 417)
})

test('진행 중이던 토큰 갱신이 로그아웃 뒤에 세션을 되살리지 않는다', async () => {
  const token = 'e30.' + Buffer.from('{"sub":"417"}').toString('base64url') + '.sig'
  client.setAccessToken(token)
  let release
  const delayed = new Promise(resolve => { release = resolve })
  globalThis.fetch = async url => {
    if (url.endsWith('/csrf')) return ok({ token: 'csrf' })
    if (url.endsWith('/refresh')) { await delayed; return ok({ accessToken: token }) }
    return ok(null)
  }
  const refreshing = auth.refreshLogin()
  await new Promise(resolve => setTimeout(resolve, 0))
  const ending = auth.logout()
  await new Promise(resolve => setTimeout(resolve, 0))
  release()
  await Promise.all([refreshing, ending])
  assert.equal(client.getCurrentUserId(), null)
})

test('탈퇴 뒤 늦게 도착한 갱신 결과로 계정이 복구되지 않는다', async () => {
  const token = 'e30.' + Buffer.from('{"sub":"417"}').toString('base64url') + '.sig'
  client.setAccessToken(token)
  let finishWithdraw, finishRefresh
  const withdrawal = new Promise(resolve => { finishWithdraw = resolve })
  const refresh = new Promise(resolve => { finishRefresh = resolve })
  globalThis.fetch = async url => {
    if (url.endsWith('/csrf')) return ok({ token: 'csrf' })
    if (url.endsWith('/account')) { await withdrawal; return ok(null) }
    await refresh; return ok({ accessToken: token })
  }
  const withdrawing = auth.withdrawAccount('password')
  const refreshing = auth.refreshLogin()
  const refreshResult = refreshing.catch(error => error)
  finishWithdraw(); await withdrawing
  finishRefresh(); await refreshResult
  assert.equal(client.getCurrentUserId(), null)
})


function userToken(id, label = 'sig') { return 'e30.' + Buffer.from(JSON.stringify({ sub: String(id) })).toString('base64url') + '.' + label }

test('이전 계정의 지연된 수정 요청을 새 계정으로 재전송하지 않는다', async () => {
  client.setAccessToken(userToken(417))
  let release
  const delayed = new Promise(resolve => { release = resolve })
  const calls = []
  globalThis.fetch = async (url, init) => {
    calls.push({ url, authorization: init.headers.get('Authorization') })
    if (calls.length === 1) { await delayed; return denied() }
    return ok(null)
  }
  const oldMutation = client.request('/babies/71', { method: 'PATCH', body: JSON.stringify({ name: '이전 계정 수정' }) }).catch(error => error)
  client.setAccessToken(userToken(500))
  release(); await oldMutation
  assert.equal(calls.length, 1)
  assert.equal(client.getCurrentUserId(), 500)
})

test('이전 갱신 실패가 나중에 로그인한 계정을 로그아웃시키지 않는다', async () => {
  client.setAccessToken(userToken(417))
  let release
  const delayed = new Promise(resolve => { release = resolve })
  globalThis.fetch = async url => {
    if (url.endsWith('/csrf')) return ok({ token: 'csrf' })
    await delayed; return denied()
  }
  const refreshing = auth.refreshLogin().catch(error => error)
  client.setAccessToken(userToken(500)); release(); await refreshing
  assert.equal(client.getCurrentUserId(), 500)
})

test('이전 재요청의 401이 새 계정을 로그아웃시키지 않는다', async () => {
  client.setAccessToken(userToken(417))
  let release, retried
  const delayed = new Promise(resolve => { release = resolve })
  const started = new Promise(resolve => { retried = resolve })
  globalThis.fetch = async (url, init) => {
    if (url.endsWith('/csrf')) return ok({ token: 'csrf' })
    if (url.endsWith('/refresh')) return ok({ accessToken: userToken(417, 'new') })
    if (init.headers.get('Authorization') === 'Bearer ' + userToken(417, 'new')) { retried(); await delayed }
    return denied()
  }
  const pending = client.request('/babies').catch(error => error)
  await started; client.setAccessToken(userToken(500)); release(); await pending
  assert.equal(client.getCurrentUserId(), 500)
})

test('다른 탭의 쿠키 계정으로 갱신되어도 원래 계정의 수정을 재전송하지 않는다', async () => {
  client.setAccessToken(userToken(417))
  let mutations = 0
  globalThis.fetch = async url => {
    if (url.endsWith('/csrf')) return ok({ token: 'csrf' })
    if (url.endsWith('/refresh')) return ok({ accessToken: userToken(500) })
    mutations++
    return mutations === 1 ? denied() : ok(null)
  }
  await client.request('/babies/71', { method: 'PATCH', body: '{}' }).catch(error => error)
  assert.equal(mutations, 1)
})
