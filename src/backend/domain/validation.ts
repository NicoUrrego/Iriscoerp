export class DomainError extends Error {
  constructor(message: string, readonly status = 400) { super(message); this.name = 'DomainError'; }
}
export function fail(message: string, status = 400): never { throw new DomainError(message, status); }
export function object(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string,unknown> : fail('Se requiere un objeto');
}
export function text(value: unknown, field: string, max = 500): string {
  return typeof value === 'string' && value.trim() && value.length <= max ? value.trim() : fail(`Campo inválido: ${field}`);
}
export function num(value: unknown, field: string, min = 0, max = 1e9): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max ? value : fail(`Número inválido: ${field}`);
}
export function integer(value: unknown, field: string, min = 0, max = 1e9): number {
  const n = num(value, field, min, max); return Number.isSafeInteger(n) ? n : fail(`${field} debe ser entero`);
}
export function cents(value: unknown, field: string): number { return Math.round(num(value,field) * 100); }
export function safeMoney(value: number): number { return Number.isSafeInteger(value) && value >= 0 ? value : fail('Importe fuera del límite de precisión'); }
export function choice<T extends string>(value: unknown, choices: readonly T[], field: string): T {
  return choices.includes(value as T) ? value as T : fail(`Opción inválida: ${field}`);
}
export function email(value: unknown): string {
  const s = text(value,'correo'); return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) ? s.toLowerCase() : fail('Correo inválido');
}
export function password(value: unknown): string {
  return typeof value === 'string' && value.length >= 8 && value.length <= 256 ? value : fail('La contraseña debe tener entre 8 y 256 caracteres');
}
export function date(value: unknown): string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) fail('Fecha inválida');
  const d = new Date(value+'T12:00:00Z');
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0,10) === value ? value : fail('Fecha inválida');
}
export const today = () => {
  const p = new Intl.DateTimeFormat('en-US',{ timeZone:'America/Bogota',year:'numeric',month:'2-digit',day:'2-digit' }).formatToParts(new Date());
  return ['year','month','day'].map(k=>p.find(x=>x.type===k)!.value).join('-');
};
export const variation = (a: number,b: number) => b ? (a-b)*100/b : a ? null : 0;
