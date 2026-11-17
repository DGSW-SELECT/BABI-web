import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

const source = await readFile(new URL('./sessionClient.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source.replaceAll('import.meta.env', '({ VITE_PROFILE_API_URL: "/backend", VITE_USE_MOCK: "false" })'), {
  compilerOptions: { target: ts.ScriptTarget.ES2023, module: ts.ModuleKind.ESNext },
}).outputText
const client = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)
const originalFetch = globalThis.fetch
test('JWT의 사용자 subject를 읽고 잘못된 식별자는 거부한다', () => {
  for (const [sub, expected] of [['417', 417], ['0', null], ['-1', null], ['user@example.invalid', null], ['9007199254740992', null]]) {
    client.setAccessToken('e30.' + Buffer.from(JSON.stringify({ sub })).toString('base64url') + '.test')
    assert.equal(client.getCurrentUserId(), expected)
  }
  client.setAccessToken('invalid-token')
  assert.equal(client.getCurrentUserId(), null)
  client.clearAccessToken()
  assert.equal(client.getCurrentUserId(), null)
})
test.afterEach(() => {
  globalThis.fetch = originalFetch
  client.clearAccessToken?.()
})

test('서버의 공통 응답에서 data를 반환한다', async () => {
  globalThis.fetch = async () => Response.json({ success: true, message: '조회 완료', data: [{ babyId: 1 }] })
  assert.deepEqual(await client.request('/babies'), [{ babyId: 1 }])
})

test('JWT, JSON 헤더, 쿠키 옵션을 함께 전달한다', async () => {
  client.setAccessToken('sample-access-token')
  globalThis.fetch = async (url, options) => {
    assert.equal(url, '/backend/babies')
    assert.equal(options.headers.get('Authorization'), 'Bearer sample-access-token')
    assert.equal(options.headers.get('Content-Type'), 'application/json')
    assert.equal(options.headers.get('Accept'), 'application/json')
    assert.equal(options.headers.get('X-Request-Test'), 'yes')
    assert.equal(options.credentials, 'include')
    return Response.json({ success: true, data: { babyId: 1 } })
  }
  await client.request('/babies', { method: 'POST', headers: new Headers({ 'X-Request-Test': 'yes' }), body: JSON.stringify({ name: '아기' }) })
})

test('로그인 같은 공개 요청에는 보관된 JWT를 붙이지 않는다', async () => {
  client.setAccessToken('sample-access-token')
  globalThis.fetch = async (_url, options) => {
    assert.equal(options.headers.has('Authorization'), false)
    assert.equal('auth' in options, false)
    return Response.json({ success: true, data: { accessToken: 'new' } })
  }
  await client.request('/auth/login', { method: 'POST', auth: false })
})

test('multipart의 Content-Type은 브라우저가 boundary와 함께 정하게 한다', async () => {
  const body = new FormData()
  body.append('audio', new Blob(['audio']), 'recording.webm')
  globalThis.fetch = async (_url, options) => {
    assert.equal(options.body, body)
    assert.equal(options.headers.has('Content-Type'), false)
    return Response.json({ success: true, data: {} })
  }
  await client.request('/upload', { method: 'POST', body })
})

for (const status of [200, 400, 401, 403]) {
  test(`${status} 응답의 실패 상태와 서버 오류 정보를 보존한다`, async () => {
    globalThis.fetch = async () => Response.json({ success: false, message: '입력값을 확인해주세요.', data: null, error: { code: 'VALIDATION_ERROR', details: [{ field: 'email', reason: '이메일 형식 오류' }] } }, { status })
    await assert.rejects(client.request('/babies'), error => {
      assert.equal(error.message, '입력값을 확인해주세요.')
      assert.equal(error.status, status)
      assert.equal(error.code, 'VALIDATION_ERROR')
      assert.deepEqual(error.details, [{ field: 'email', reason: '이메일 형식 오류' }])
      return true
    })
  })
}

test('PDF에 있는 구형 오류 응답도 메시지와 코드를 유지한다', async () => {
  globalThis.fetch = async () => Response.json({ code: 'NOT_FOUND', message: '기록이 없어요.' }, { status: 404 })
  await assert.rejects(client.request('/babies/1'), error => error.status === 404 && error.code === 'NOT_FOUND' && error.message === '기록이 없어요.')
})

test('본문이 없는 204 응답을 JSON으로 읽지 않는다', async () => {
  globalThis.fetch = async () => new Response(null, { status: 204 })
  assert.equal(await client.request('/babies/1/members/me', { method: 'DELETE' }), undefined)
})

test('HTML 응답을 데이터로 반환하거나 사용자에게 그대로 노출하지 않는다', async () => {
  globalThis.fetch = async () => new Response('<html>upstream error</html>', { status: 502, headers: { 'Content-Type': 'text/html' } })
  await assert.rejects(client.request('/babies'), error => error.status === 502 && error.code === 'INVALID_RESPONSE' && !error.message.includes('<html>'))
})

test('JSON이 깨졌거나 공통 응답 형식이 아니면 오류로 처리한다', async () => {
  for (const body of ['{broken', 'null', '{}']) {
    globalThis.fetch = async () => new Response(body, { headers: { 'Content-Type': 'application/json' } })
    await assert.rejects(client.request('/babies'), error => error.code === 'INVALID_RESPONSE')
  }
})

test('취소한 요청의 AbortError를 변경하지 않는다', async () => {
  const controller = new AbortController()
  const error = new DOMException('cancelled', 'AbortError')
  globalThis.fetch = async (_url, options) => {
    assert.equal(options.signal, controller.signal)
    throw error
  }
  await assert.rejects(client.request('/babies', { signal: controller.signal }), caught => caught === error)
})

test('네트워크 연결 실패를 알아볼 수 있는 오류로 반환한다', async () => {
  globalThis.fetch = async () => { throw new TypeError('Failed to fetch') }
  await assert.rejects(client.request('/babies'), error => error.code === 'NETWORK_ERROR' && error.status === 0)
})

test('토큰을 지우면 다음 요청에는 인증 헤더가 없다', async () => {
  client.setAccessToken('sample-access-token')
  client.clearAccessToken()
  globalThis.fetch = async (_url, options) => {
    assert.equal(options.headers.has('Authorization'), false)
    return Response.json({ success: true, data: [] })
  }
  await client.request('/babies')
})
