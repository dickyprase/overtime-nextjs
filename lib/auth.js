import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'overtime-secret-key-2024');
const COOKIE_NAME = 'overtime_session';

export async function createSession(user) {
  const token = await new SignJWT({
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    salary: user.salary,
    mealAllowance: user.mealAllowance,
    telegram_id: user.telegram_id || null,
    phone: user.phone || null
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(JWT_SECRET);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60,
    path: '/'
  });

  return token;
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (e) {
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) return { error: true, status: 401, message: 'Unauthorized' };
  return { error: false, user: session };
}

export async function requireAdmin() {
  const auth = await requireAuth();
  if (auth.error) return auth;
  if (auth.user.role !== 'admin') return { error: true, status: 403, message: 'Admin only' };
  return auth;
}
