export const randomHex = (bytes: number) => Array.from(crypto.getRandomValues(new Uint8Array(bytes)),n=>n.toString(16).padStart(2,'0')).join('');
const hex = (buffer: ArrayBuffer) => Array.from(new Uint8Array(buffer),n=>n.toString(16).padStart(2,'0')).join('');
export async function derive(password: string,salt: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
  return hex(await crypto.subtle.deriveBits({ name:'PBKDF2',hash:'SHA-256',salt:new TextEncoder().encode(salt),iterations:600000 },key,256));
}
export async function digest(token: string): Promise<string> { return hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token))); }
export function equal(a: string,b: string): boolean {
  let difference = a.length ^ b.length;
  for (let i=0;i<Math.max(a.length,b.length);i++) difference |= (a.charCodeAt(i)||0) ^ (b.charCodeAt(i)||0);
  return difference === 0;
}
