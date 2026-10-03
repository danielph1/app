import crypto from 'crypto';

// Verifica senha compatível com Django/Werkzeug pbkdf2_sha256
// Formato: pbkdf2_sha256$iterations$salt$hash_base64
// Também aceita senha em texto puro (algumas contas antigas têm '123456')
export function verifyPassword(input: string, stored: string | null | undefined): boolean {
  if (!stored) return false;
  // Texto puro (legado)
  if (!stored.includes('$')) return input === stored;

  const parts = stored.split('$');
  if (parts.length !== 4) return false;
  const [algo, iterStr, salt, hashB64] = parts;
  if (!algo.startsWith('pbkdf2_sha')) return false;
  const iterations = parseInt(iterStr, 10);
  const digest = algo.replace('pbkdf2_', '').replace('sha', 'sha');
  // Django guarda hash em base64
  const expected = Buffer.from(hashB64, 'base64');
  const derived = crypto.pbkdf2Sync(input, salt, iterations, expected.length, digest);
  return crypto.timingSafeEqual(expected, derived);
}

export function hashPassword(password: string, iterations = 310000): string {
  const salt = crypto.randomBytes(9).toString('base64').replace(/[+/=]/g, '').slice(0, 12);
  const derived = crypto.pbkdf2Sync(password, salt, iterations, 32, 'sha256');
  return `pbkdf2_sha256$${iterations}$${salt}$${derived.toString('base64')}`;
}
