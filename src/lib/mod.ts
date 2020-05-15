export function mod(number: number, mod: number): number {
    return ((number % mod) + mod) % mod;
}