/**
 * Tạo mật khẩu ngẫu nhiên với độ dài và độ phức tạp được chỉ định
 * @param length Độ dài mật khẩu (mặc định: 12)
 * @returns Chuỗi mật khẩu ngẫu nhiên
 */
export function generateRandomPassword(length: number = 12): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '!@#$%^&*';

  const allChars = lowercase + uppercase + numbers + special;

  // Đảm bảo mật khẩu có ít nhất 1 ký tự từ mỗi loại
  let password =
    lowercase[Math.floor(Math.random() * lowercase.length)] +
    uppercase[Math.floor(Math.random() * uppercase.length)] +
    numbers[Math.floor(Math.random() * numbers.length)] +
    special[Math.floor(Math.random() * special.length)];

  // Thêm các ký tự ngẫu nhiên cho đến khi đủ độ dài
  for (let i = password.length; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * allChars.length);
    password += allChars[randomIndex];
  }

  // Trộn ngẫu nhiên các ký tự trong mật khẩu
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

/**
 * Kiểm tra độ mạnh của mật khẩu
 * @param password Mật khẩu cần kiểm tra
 * @returns Điểm đánh giá độ mạnh (0-100)
 */
export function checkPasswordStrength(password: string): number {
  let score = 0;

  // Độ dài tối thiểu
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 10;

  // Chứa chữ thường
  if (/[a-z]/.test(password)) score += 10;

  // Chứa chữ hoa
  if (/[A-Z]/.test(password)) score += 10;

  // Chứa số
  if (/[0-9]/.test(password)) score += 10;

  // Chứa ký tự đặc biệt
  if (/[!@#$%^&*]/.test(password)) score += 10;

  // Đa dạng ký tự
  const uniqueChars = new Set(password).size;
  score += Math.min(20, uniqueChars * 2);

  // Không lặp lại ký tự liên tiếp
  if (!/(.)\1{2,}/.test(password)) score += 10;

  return Math.min(100, score);
}

/**
 * Kiểm tra xem mật khẩu có đáp ứng yêu cầu tối thiểu không
 * @param password Mật khẩu cần kiểm tra
 * @returns true nếu mật khẩu đáp ứng yêu cầu
 */
export function isPasswordValid(password: string): boolean {
  // Ít nhất 8 ký tự
  if (password.length < 8) return false;

  // Phải chứa ít nhất 1 chữ thường
  if (!/[a-z]/.test(password)) return false;

  // Phải chứa ít nhất 1 chữ hoa
  if (!/[A-Z]/.test(password)) return false;

  // Phải chứa ít nhất 1 số
  if (!/[0-9]/.test(password)) return false;

  // Phải chứa ít nhất 1 ký tự đặc biệt
  if (!/[!@#$%^&*]/.test(password)) return false;

  return true;
}
