
import { User, Gender } from '../types';

// --- MOCK DATABASE ---
const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'سارا جلالی',
    phone: '09123456789',
    passwordHash: 'hashed_pass_123', // Simulated hash
    city: 'تهران',
    province: 'تهران',
    avatar: 'https://picsum.photos/200/200?random=99',
    email: 'sara@example.com',
    gender: Gender.FEMALE,
    bio: 'عاشق محیط زیست و زندگی مینیمال.',
    joinedDate: '1402/01/15',
    lastActive: new Date().toISOString(),
    donatedCount: 12,
    receivedCount: 5,
    trustScore: 95,
    isAdmin: true
  }
];

const OTP_STORE: Record<string, { code: string, expires: number, attempts: number }> = {};

// --- HELPER FUNCTIONS ---

export const validatePhone = (phone: string): boolean => {
  const regex = /^09[0-9]{9}$/;
  return regex.test(phone);
};

export const hashPassword = (password: string): string => {
  // In a real app, use bcrypt or argon2 on the server.
  // Here we just simulate hashing for the demo.
  return `hashed_${password}_secure`;
};

// --- API SIMULATION ---

export const checkUserExists = async (phone: string): Promise<boolean> => {
  await new Promise(r => setTimeout(r, 500)); // Simulate network delay
  return MOCK_USERS.some(u => u.phone === phone);
};

export const sendOTP = async (phone: string): Promise<'SUCCESS' | 'LIMIT_REACHED'> => {
  await new Promise(r => setTimeout(r, 800));
  
  // Rate limiting check (Mock)
  const existing = OTP_STORE[phone];
  if (existing && existing.attempts > 3 && existing.expires > Date.now()) {
    return 'LIMIT_REACHED';
  }

  // Generate 4 digit OTP
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  console.log(`[SERVER] OTP for ${phone}: ${code}`); // For testing purposes
  
  OTP_STORE[phone] = {
    code: '1234', // Hardcoded for demo convenience, but logic supports dynamic
    expires: Date.now() + 120000, // 2 minutes
    attempts: 0
  };
  
  return 'SUCCESS';
};

export const verifyOTP = async (phone: string, code: string): Promise<{ success: boolean, message?: string }> => {
  await new Promise(r => setTimeout(r, 600));
  
  const record = OTP_STORE[phone];
  if (!record) return { success: false, message: 'کد منقضی شده است.' };
  
  if (Date.now() > record.expires) {
    return { success: false, message: 'زمان کد به پایان رسیده است.' };
  }

  if (record.code !== code) {
    record.attempts += 1;
    return { success: false, message: 'کد وارد شده اشتباه است.' };
  }

  return { success: true };
};

export const loginWithPassword = async (phone: string, password: string): Promise<{ success: boolean, user?: User, message?: string }> => {
  await new Promise(r => setTimeout(r, 1000));
  
  const user = MOCK_USERS.find(u => u.phone === phone);
  if (!user) return { success: false, message: 'کاربر یافت نشد.' };

  const hash = hashPassword(password);
  if (user.passwordHash !== hash) {
    return { success: false, message: 'رمز عبور اشتباه است.' };
  }

  // Update last active
  user.lastActive = new Date().toISOString();
  return { success: true, user };
};

export const registerUser = async (data: Partial<User> & { password: string }): Promise<User> => {
  await new Promise(r => setTimeout(r, 1500));

  const newUser: User = {
    id: `u${Date.now()}`,
    name: data.name || 'کاربر جدید',
    phone: data.phone!,
    passwordHash: hashPassword(data.password),
    city: data.city || 'نامشخص',
    province: data.province,
    avatar: data.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'User')}&background=random`,
    email: data.email,
    gender: data.gender,
    birthDate: data.birthDate,
    address: data.address,
    joinedDate: new Date().toLocaleDateString('fa-IR'),
    lastActive: new Date().toISOString(),
    donatedCount: 0,
    receivedCount: 0,
    trustScore: 50, // Start with neutral trust
    isAdmin: false
  };

  MOCK_USERS.push(newUser);
  return newUser;
};

export const updateUserProfile = async (userId: string, updates: Partial<User>): Promise<User | null> => {
    await new Promise(r => setTimeout(r, 1000));
    const index = MOCK_USERS.findIndex(u => u.id === userId);
    if (index === -1) return null;
    
    MOCK_USERS[index] = { ...MOCK_USERS[index], ...updates };
    return MOCK_USERS[index];
}
