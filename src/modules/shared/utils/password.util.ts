export function generateRandomPassword(length: number = 12): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '!@#$%^&*';

  const allChars = lowercase + uppercase + numbers + special;

  let password =
    lowercase[Math.floor(Math.random() * lowercase.length)] +
    uppercase[Math.floor(Math.random() * uppercase.length)] +
    numbers[Math.floor(Math.random() * numbers.length)] +
    special[Math.floor(Math.random() * special.length)];

  for (let i = password.length; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * allChars.length);
    password += allChars[randomIndex];
  }

  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

export function checkPasswordStrength(password: string): number {
  let score = 0;

  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 10;

  if (/[a-z]/.test(password)) score += 10;

  if (/[A-Z]/.test(password)) score += 10;

  if (/[0-9]/.test(password)) score += 10;

  if (/[!@#$%^&*]/.test(password)) score += 10;

  const uniqueChars = new Set(password).size;
  score += Math.min(20, uniqueChars * 2);

  if (!/(.)\1{2,}/.test(password)) score += 10;

  return Math.min(100, score);
}

export function isPasswordValid(password: string): boolean {
  if (password.length < 8) return false;

  if (!/[a-z]/.test(password)) return false;

  if (!/[A-Z]/.test(password)) return false;

  if (!/[0-9]/.test(password)) return false;

  if (!/[!@#$%^&*]/.test(password)) return false;

  return true;
}
