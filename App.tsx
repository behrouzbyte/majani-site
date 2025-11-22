
import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, MapPin, Bell, ArrowRight, Camera, 
  Image as ImageIcon, AlertTriangle, Shield, MessageCircle,
  User as UserIcon, Eye, EyeOff, X, ArrowUpDown, Filter, Check
} from 'lucide-react';
import Navigation from './components/Navigation';
import ProfileView from './components/ProfileView';
import ItemDetailView from './components/ItemDetailView';
import ChatDetailView from './components/ChatDetailView';
import { Item, User, Category, ItemCondition, ChatSession, ChatMessage, AppView, AuthStage, Gender } from './types';
import * as GeminiService from './services/geminiService';
import * as AuthService from './services/authService';

// --- HELPER FUNCTIONS ---
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function getPersianRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'لحظاتی پیش';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes.toLocaleString('fa-IR')} دقیقه پیش`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours.toLocaleString('fa-IR')} ساعت پیش`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'دیروز';
  if (diffInDays < 7) return `${diffInDays.toLocaleString('fa-IR')} روز پیش`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7).toLocaleString('fa-IR')} هفته پیش`;
  
  return new Intl.DateTimeFormat('fa-IR', { month: 'long', day: 'numeric' }).format(date);
}

// --- MOCK DATA ---
// Helper to generate recent dates for demo
const timeAgo = (hours: number) => new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

const INITIAL_ITEMS: Item[] = [
  {
    id: 'i1',
    userId: 'u2',
    title: 'صندلی چوبی قدیمی',
    description: 'یک صندلی چوبی محکم که نیاز به کمی سنباده‌کاری دارد. عالی برای پروژه‌های بازسازی!',
    images: ['https://images.unsplash.com/photo-1503602642458-23211144584b?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1519947486511-46149fa0a254?auto=format&fit=crop&w=600&q=80'],
    category: Category.HOME,
    condition: ItemCondition.USED,
    location: { lat: 35.6892, lng: 51.3890, address: 'میدان انقلاب' },
    city: 'تهران',
    createdAt: timeAgo(2), // 2 hours ago
    status: 'AVAILABLE',
    views: 124
  },
  {
    id: 'i2',
    userId: 'u3',
    title: 'کتاب حساب دیفرانسیل',
    description: 'کتاب ریاضیات دانشگاهی، ترم پیش استفاده شده. بدون خط خوردگی و کاملاً تمیز.',
    images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'],
    category: Category.BOOKS,
    condition: ItemCondition.ALMOST_NEW,
    location: { lat: 35.7219, lng: 51.3347, address: 'صادقیه' },
    city: 'تهران',
    createdAt: timeAgo(5), // 5 hours ago
    status: 'AVAILABLE',
    views: 45
  },
  {
    id: 'i3',
    userId: 'u4',
    title: 'دوچرخه بچه گانه (قرمز)',
    description: 'لاستیک‌ها سالم، بدنه بدون زنگ‌زدگی. پسرم بزرگ شده و دیگه استفاده نمی‌کنه.',
    images: ['https://images.unsplash.com/photo-1532298229144-0ec0c57e36cf?auto=format&fit=crop&w=600&q=80'],
    category: Category.KIDS,
    condition: ItemCondition.USED,
    location: { lat: 35.7448, lng: 51.3753, address: 'ونک' },
    city: 'تهران',
    createdAt: timeAgo(25), // Yesterday
    status: 'RESERVED',
    views: 210
  },
  {
    id: 'i4',
    userId: 'u5',
    title: 'مبل راحتی سه نفره',
    description: 'مبل طوسی بزرگ. خیلی راحت هست. لطفاً اگر وانت دارید پیام بدید.',
    images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80'],
    category: Category.HOME,
    condition: ItemCondition.USED,
    location: { lat: 35.6997, lng: 51.3380, address: 'ستارخان' },
    city: 'تهران',
    createdAt: timeAgo(48), // 2 days ago
    status: 'AVAILABLE',
    views: 89
  },
  {
    id: 'i5',
    userId: 'u6',
    title: 'لپ‌تاپ قدیمی لنوو',
    description: 'روشن میشه ولی باتریش خرابه. برای قطعات یا استفاده با شارژر مناسبه.',
    images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80'],
    category: Category.ELECTRONICS,
    condition: ItemCondition.HEAVILY_USED,
    location: { lat: 35.7000, lng: 51.4000, address: 'هفت تیر' },
    city: 'تهران',
    createdAt: timeAgo(120), // 5 days ago
    status: 'AVAILABLE',
    views: 150
  }
];

export default function App() {
  const [view, setView] = useState<AppView>('HOME');
  const [postAuthView, setPostAuthView] = useState<AppView>('HOME');
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<Item[]>(INITIAL_ITEMS);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);
  const [activeFilter, setActiveFilter] = useState<Category | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'NEAREST'>('NEWEST');
  const [maxDistance, setMaxDistance] = useState<number | null>(null);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Recent Views History
  const [recentItems, setRecentItems] = useState<Item[]>([]);
  
  // Mock Current User Location (Center of Tehran for demo)
  // In a real app, we would fetch this
  const [currentUserLocation, setCurrentUserLocation] = useState({ lat: 35.6892, lng: 51.3890 });

  useEffect(() => {
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
              (position) => {
                  setCurrentUserLocation({
                      lat: position.coords.latitude,
                      lng: position.coords.longitude
                  });
              },
              (error) => {
                  console.log("Using default location (Tehran)");
              }
          );
      }
  }, []);
  
  // --- AUTH STATES ---
  const [authStage, setAuthStage] = useState<AuthStage>('PHONE_ENTRY');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  // Registration Form State
  const [regForm, setRegForm] = useState({
    name: '',
    password: '',
    confirmPassword: '',
    city: '',
    province: '',
    gender: Gender.RATHER_NOT_SAY,
    email: '',
    birthDate: '',
    address: '',
    agreedToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);

  // Post Item States
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<Category>(Category.OTHERS);
  const [newItemCondition, setNewItemCondition] = useState<ItemCondition>(ItemCondition.USED);
  const [newItemImages, setNewItemImages] = useState<string[]>([]);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- EFFECTS ---
  useEffect(() => {
    let interval: any;
    if (otpTimer > 0) {
      interval = setInterval(() => setOtpTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // --- NAVIGATION GUARD ---
  const handleNavigation = (targetView: AppView) => {
    const protectedViews: AppView[] = ['POST_ITEM', 'CHAT_LIST', 'PROFILE'];
    
    if (protectedViews.includes(targetView) && !user) {
      setPostAuthView(targetView);
      setView('AUTH');
    } else {
      setView(targetView);
    }
  };

  // --- AUTH HANDLERS ---

  const handlePhoneSubmit = async () => {
    if (!AuthService.validatePhone(phoneNumber)) {
      setAuthError('لطفاً شماره موبایل معتبر وارد کنید (مثال: 09123456789)');
      return;
    }
    setAuthError('');
    setIsLoading(true);
    
    try {
      const result = await AuthService.sendOTP(phoneNumber);
      if (result === 'SUCCESS') {
        setOtpTimer(120); // 2 minutes
        setAuthStage('OTP_VERIFY');
      } else {
        setAuthError('تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً بعداً تلاش کنید.');
      }
    } catch (e) {
      setAuthError('خطا در برقراری ارتباط.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerify = async () => {
    if (otpCode.length !== 4) return;
    setAuthError('');
    setIsLoading(true);

    const verifyResult = await AuthService.verifyOTP(phoneNumber, otpCode);
    if (!verifyResult.success) {
      setAuthError(verifyResult.message || 'کد نامعتبر است');
      setIsLoading(false);
      return;
    }

    // Check if user exists
    const exists = await AuthService.checkUserExists(phoneNumber);
    setIsLoading(false);

    if (exists) {
      setAuthStage('LOGIN_PASSWORD');
    } else {
      setAuthStage('REGISTER_FORM');
    }
  };

  const handleLogin = async () => {
    if (!regForm.password) {
        setAuthError('رمز عبور را وارد کنید');
        return;
    }
    setIsLoading(true);
    setAuthError('');
    
    const result = await AuthService.loginWithPassword(phoneNumber, regForm.password);
    if (result.success && result.user) {
        setUser(result.user);
        setView(postAuthView); // Go to requested view
        // Reset auth states
        setAuthStage('PHONE_ENTRY');
        setRegForm({ ...regForm, password: '' });
    } else {
        setAuthError(result.message || 'خطا در ورود');
    }
    setIsLoading(false);
  };

  const handleRegister = async () => {
    // Validations
    if (!regForm.name) return setAuthError('نام و نام خانوادگی الزامی است');
    if (regForm.password.length < 6) return setAuthError('رمز عبور باید حداقل ۶ کاراکتر باشد');
    if (regForm.password !== regForm.confirmPassword) return setAuthError('تکرار رمز عبور مطابقت ندارد');
    if (!regForm.city) return setAuthError('انتخاب شهر الزامی است');
    if (!regForm.agreedToTerms) return setAuthError('پذیرش قوانین الزامی است');

    setIsLoading(true);
    setAuthError('');

    try {
        const newUser = await AuthService.registerUser({
            name: regForm.name,
            phone: phoneNumber,
            password: regForm.password,
            city: regForm.city,
            province: regForm.province,
            email: regForm.email,
            gender: regForm.gender,
            birthDate: regForm.birthDate,
            address: regForm.address
        });
        setUser(newUser);
        setView(postAuthView);
    } catch (e) {
        setAuthError('خطا در ثبت نام');
    } finally {
        setIsLoading(false);
    }
  };

  const handleLogout = () => {
      setUser(null);
      setView('HOME');
      setPostAuthView('HOME');
      setAuthStage('PHONE_ENTRY');
      setPhoneNumber('');
      setOtpCode('');
      setRegForm({...regForm, password: ''});
  }

  // --- OTHER HANDLERS ---

  const handleImagePick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setNewItemImages(prev => [...prev, imageUrl]);
    }
    // Reset value to allow selecting the same file again if deleted
    if (event.target) event.target.value = '';
  };

  const removeImage = (index: number) => {
    const updatedImages = [...newItemImages];
    updatedImages.splice(index, 1);
    setNewItemImages(updatedImages);
  };

  const handlePostItem = () => {
    if (!user) return;
    const item: Item = {
      id: `i${Date.now()}`,
      userId: user.id,
      title: newItemTitle,
      description: newItemDesc,
      images: newItemImages.length > 0 ? newItemImages : [`https://images.unsplash.com/photo-1513542787859-ff391de288aa?auto=format&fit=crop&w=400&q=80`],
      category: newItemCategory,
      condition: newItemCondition,
      location: { lat: 35.6892, lng: 51.3890, address: 'موقعیت من' },
      city: user.city,
      createdAt: new Date().toISOString(),
      status: 'AVAILABLE',
      views: 0
    };
    setItems([item, ...items]);
    // Reset form
    setNewItemTitle('');
    setNewItemDesc('');
    setNewItemImages([]);
    setNewItemCategory(Category.OTHERS);
    setNewItemCondition(ItemCondition.USED);
    setView('HOME');
  };

  const generateAIContent = async () => {
    if (!newItemTitle) return;
    setIsGeneratingDesc(true);
    const desc = await GeminiService.generateDescription(newItemTitle, newItemCondition, newItemCategory);
    setNewItemDesc(desc);
    setIsGeneratingDesc(false);
  };

  const handleReserveItem = (item: Item) => {
    if (!user) {
        setPostAuthView('ITEM_DETAIL');
        setView('AUTH');
        return;
    }

    // 1. Update item status locally
    const updatedItems = items.map(i => i.id === item.id ? { ...i, status: 'RESERVED' as const } : i);
    setItems(updatedItems);
    const updatedItem = updatedItems.find(i => i.id === item.id);
    if (updatedItem) setSelectedItem(updatedItem);

    // 2. Start Chat
    startChat(item);
  };

  const startChat = (item: Item) => {
    if (!user) {
        setPostAuthView('CHAT_LIST');
        setView('AUTH');
        return;
    }
    // Check if chat exists
    const existing = chats.find(c => c.itemId === item.id && c.participants.includes(user.id));
    if (existing) {
      setSelectedChat(existing);
      setView('CHAT_DETAIL');
      return;
    }

    const newChat: ChatSession = {
      id: `c${Date.now()}`,
      itemId: item.id,
      participants: [user.id, item.userId],
      messages: [],
      lastMessage: '',
      lastUpdated: Date.now()
    };
    setChats([newChat, ...chats]);
    setSelectedChat(newChat);
    setView('CHAT_DETAIL');
  };

  const sendMessage = (text: string) => {
    if (!selectedChat || !user) return;
    const msg: ChatMessage = {
      id: `m${Date.now()}`,
      senderId: user.id,
      text,
      timestamp: Date.now()
    };
    
    const updatedChat = {
      ...selectedChat,
      messages: [...selectedChat.messages, msg],
      lastMessage: text,
      lastUpdated: Date.now()
    };

    setChats(chats.map(c => c.id === selectedChat.id ? updatedChat : c));
    setSelectedChat(updatedChat);
  };

  const handleUpdateProfile = async (updates: Partial<User>) => {
      if (!user) return;
      setIsLoading(true);
      const updated = await AuthService.updateUserProfile(user.id, updates);
      if (updated) setUser(updated);
      setIsLoading(false);
  }

  const handleTrustScoreUpdate = async (userId: string, newScore: number) => {
      if (user && user.id === userId) {
          const updatedUser = { ...user, trustScore: newScore };
          setUser(updatedUser);
          await AuthService.updateUserProfile(userId, { trustScore: newScore });
      }
  };

  const handleItemClick = (item: Item) => {
    setSelectedItem(item);
    setView('ITEM_DETAIL');
    
    // Add to recent items history (unique items only, max 20)
    setRecentItems(prev => {
      const filtered = prev.filter(i => i.id !== item.id);
      return [item, ...filtered].slice(0, 20);
    });
  };

  // --- VIEWS (Render Functions that are SAFE to keep - No Hooks Inside) ---

  const renderAuth = () => {
    return (
      <div className="h-full w-full overflow-y-auto bg-white">
        <div className="min-h-full flex flex-col items-center justify-center p-6 animate-in fade-in duration-300 relative">
          
          <button 
            onClick={() => { setView('HOME'); setPostAuthView('HOME'); }} 
            className="absolute top-4 left-4 text-gray-500 flex items-center gap-1 text-sm"
          >
              <ArrowRight size={16} className="rotate-180" /> بازگشت به خانه
          </button>

          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mb-4 text-primary-600">
             <Shield size={40} />
          </div>
          <h1 className="text-2xl font-bold text-primary-700 mb-2">مجانی</h1>
          
          {authStage === 'PHONE_ENTRY' && (
            <div className="w-full max-w-sm space-y-5">
              <p className="text-center text-gray-500 mb-6">برای ورود یا ثبت‌نام، شماره موبایل خود را وارد کنید.</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">شماره موبایل</label>
                <div className="relative">
                  <input 
                    type="tel" 
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-left dir-ltr pl-10"
                    placeholder="0912 345 6789"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <UserIcon size={20} />
                  </div>
                </div>
              </div>
              {authError && <p className="text-red-500 text-sm flex items-center gap-1"><AlertTriangle size={14}/> {authError}</p>}
              <button 
                onClick={handlePhoneSubmit}
                disabled={isLoading || phoneNumber.length < 10}
                className="w-full bg-primary-600 text-white py-4 rounded-xl font-bold hover:bg-primary-700 disabled:opacity-50 transition-colors shadow-lg shadow-primary-100"
              >
                {isLoading ? 'درحال پردازش...' : 'ادامه'}
              </button>
            </div>
          )}

          {authStage === 'OTP_VERIFY' && (
            <div className="w-full max-w-sm space-y-5">
              <p className="text-center text-gray-500 mb-6">کد ۴ رقمی ارسال شده به <span className="text-gray-900 font-bold dir-ltr inline-block">{phoneNumber}</span> را وارد کنید.</p>
              <div>
                <input 
                  type="text" 
                  maxLength={4}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 text-center tracking-[1em] text-2xl outline-none font-bold text-gray-800"
                  placeholder="----"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                />
                <div className="flex justify-between mt-2 text-sm">
                   <span className="text-gray-400">کد دریافت نشد؟</span>
                   {otpTimer > 0 ? (
                     <span className="text-primary-600">{Math.floor(otpTimer / 60)}:{String(otpTimer % 60).padStart(2, '0')}</span>
                   ) : (
                     <button onClick={handlePhoneSubmit} className="text-primary-600 font-medium">ارسال مجدد</button>
                   )}
                </div>
                <div className="text-center mt-4 text-xs text-gray-400">کد آزمایشی: 1234</div>
              </div>
              {authError && <p className="text-red-500 text-sm flex items-center gap-1"><AlertTriangle size={14}/> {authError}</p>}
              <button 
                onClick={handleOtpVerify}
                disabled={isLoading || otpCode.length < 4}
                className="w-full bg-primary-600 text-white py-4 rounded-xl font-bold hover:bg-primary-700 disabled:opacity-50 transition-colors shadow-lg"
              >
                {isLoading ? 'درحال بررسی...' : 'تایید کد'}
              </button>
              <button onClick={() => { setAuthStage('PHONE_ENTRY'); setAuthError(''); }} className="w-full text-gray-500 text-sm">ویرایش شماره</button>
            </div>
          )}

          {authStage === 'LOGIN_PASSWORD' && (
             <div className="w-full max-w-sm space-y-5">
              <div className="text-center mb-6">
                <h2 className="text-lg font-bold text-gray-800">خوش آمدید!</h2>
                <p className="text-gray-500 text-sm mt-1">لطفاً رمز عبور خود را وارد کنید.</p>
              </div>
              <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">رمز عبور</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none dir-ltr text-left pl-10"
                      value={regForm.password}
                      onChange={(e) => setRegForm({...regForm, password: e.target.value})}
                    />
                    <button onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                    </button>
                  </div>
              </div>
              {authError && <p className="text-red-500 text-sm flex items-center gap-1"><AlertTriangle size={14}/> {authError}</p>}
              <button 
                onClick={handleLogin}
                disabled={isLoading || !regForm.password}
                className="w-full bg-primary-600 text-white py-4 rounded-xl font-bold hover:bg-primary-700 disabled:opacity-50 transition-colors shadow-lg"
              >
                {isLoading ? 'درحال ورود...' : 'ورود به حساب'}
              </button>
              <button onClick={() => alert('لینک بازیابی رمز عبور ارسال شد.')} className="w-full text-primary-600 text-sm font-medium">فراموشی رمز عبور؟</button>
             </div>
          )}

          {authStage === 'REGISTER_FORM' && (
             <div className="w-full max-w-sm space-y-4">
               <h2 className="text-xl font-bold text-gray-800 text-center mb-4">تکمیل ثبت‌نام</h2>
               
               <div className="grid grid-cols-1 gap-4">
                 <div>
                   <label className="block text-xs font-medium text-gray-700 mb-1">نام و نام خانوادگی <span className="text-red-500">*</span></label>
                   <input className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary-500 outline-none" 
                     value={regForm.name} onChange={e => setRegForm({...regForm, name: e.target.value})} placeholder="مثال: علی رضایی"/>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">رمز عبور <span className="text-red-500">*</span></label>
                      <input type="password" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary-500 outline-none dir-ltr text-left" 
                        value={regForm.password} onChange={e => setRegForm({...regForm, password: e.target.value})}/>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">تکرار رمز <span className="text-red-500">*</span></label>
                      <input type="password" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary-500 outline-none dir-ltr text-left" 
                        value={regForm.confirmPassword} onChange={e => setRegForm({...regForm, confirmPassword: e.target.value})}/>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-3">
                   <div>
                     <label className="block text-xs font-medium text-gray-700 mb-1">استان</label>
                     <input className="w-full p-3 border border-gray-300 rounded-lg outline-none" 
                       value={regForm.province} onChange={e => setRegForm({...regForm, province: e.target.value})} placeholder="تهران"/>
                   </div>
                   <div>
                     <label className="block text-xs font-medium text-gray-700 mb-1">شهر <span className="text-red-500">*</span></label>
                     <input className="w-full p-3 border border-gray-300 rounded-lg outline-none" 
                       value={regForm.city} onChange={e => setRegForm({...regForm, city: e.target.value})} placeholder="تهران"/>
                   </div>
                 </div>

                 <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">جنسیت</label>
                    <div className="flex gap-2">
                      {Object.values(Gender).map(g => (
                        <button 
                          key={g}
                          onClick={() => setRegForm({...regForm, gender: g})}
                          className={`flex-1 py-2 text-xs rounded border ${regForm.gender === g ? 'bg-primary-50 border-primary-500 text-primary-700' : 'border-gray-200'}`}
                        >{g}</button>
                      ))}
                    </div>
                 </div>
                 
                 <div className="border-t pt-3 mt-2">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="terms" checked={regForm.agreedToTerms} onChange={e => setRegForm({...regForm, agreedToTerms: e.target.checked})} 
                        className="w-4 h-4 text-primary-600 rounded"/>
                      <label htmlFor="terms" className="text-xs text-gray-600">با <span className="text-primary-600 underline">قوانین و مقررات</span> موافقم.</label>
                    </div>
                 </div>
               </div>

               {authError && <p className="text-red-500 text-sm">{authError}</p>}
               
               <button 
                 onClick={handleRegister}
                 disabled={isLoading}
                 className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 shadow-lg mt-2"
               >
                 {isLoading ? 'در حال ثبت نام...' : 'تکمیل ثبت‌نام'}
               </button>
             </div>
          )}
        </div>
      </div>
    );
  };

  const renderHome = () => {
    // Filtering logic
    const filteredItems = items.filter(i => {
        const matchesCategory = activeFilter === 'ALL' || i.category === activeFilter;
        const dist = calculateDistance(currentUserLocation.lat, currentUserLocation.lng, i.location.lat, i.location.lng);
        const matchesDistance = maxDistance === null || dist <= maxDistance;
        
        const matchesSearch = searchQuery 
            ? (i.title.includes(searchQuery) || i.description.includes(searchQuery))
            : true;

        return matchesCategory && matchesDistance && matchesSearch;
    });

    // Sorting logic
    const sortedItems = [...filteredItems].sort((a, b) => {
      if (sortBy === 'NEAREST') {
        const distA = calculateDistance(currentUserLocation.lat, currentUserLocation.lng, a.location.lat, a.location.lng);
        const distB = calculateDistance(currentUserLocation.lat, currentUserLocation.lng, b.location.lat, b.location.lng);
        return distA - distB;
      } else {
        // Newest
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    const isSearchMode = view === 'SEARCH';

    return (
      <div className="h-full overflow-y-auto bg-gray-50 pb-24 no-scrollbar">
        {/* Header */}
        <header className={`bg-white sticky top-0 z-30 shadow-sm flex items-center justify-between transition-all ${isSearchMode ? 'p-3' : 'px-4 py-3'}`}>
          {isSearchMode ? (
              <div className="flex items-center w-full gap-2">
                  <button onClick={() => { setView('HOME'); setSearchQuery(''); }} className="p-2 -mr-2 text-gray-500"><ArrowRight size={20} /></button>
                  <div className="flex-1 bg-gray-100 rounded-xl flex items-center px-3 py-2">
                      <Search size={18} className="text-gray-400 ml-2" />
                      <input 
                        autoFocus
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="جستجو در همه آگهی‌ها..." 
                        className="bg-transparent w-full outline-none text-sm text-gray-800"
                      />
                      {searchQuery && <button onClick={() => setSearchQuery('')}><X size={16} className="text-gray-400"/></button>}
                  </div>
              </div>
          ) : (
            <>
                <div className="flex items-center gap-2 text-primary-700">
                    <MapPin size={20} />
                    <span className="font-semibold">تهران</span>
                </div>
                <div className="flex items-center gap-3">
                     <button onClick={() => setView('SEARCH')}><Search size={20} className="text-gray-600" /></button>
                     <div className="bg-gray-100 p-2 rounded-full relative">
                        <Bell size={20} className="text-gray-600" />
                        <span className="absolute top-0 left-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                     </div>
                </div>
            </>
          )}
        </header>

        {/* Categories */}
        {!isSearchMode && (
            <div className="py-4">
            <div className="flex justify-between items-center mb-3 px-4">
                <h2 className="font-bold text-gray-800">دسته‌بندی‌ها</h2>
            </div>
            <div className="grid grid-cols-3 gap-2 px-4">
                <button 
                onClick={() => setActiveFilter('ALL')}
                className={`py-3 px-2 rounded-xl text-xs font-bold text-center transition-colors border ${activeFilter === 'ALL' ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-200' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                همه آگهی‌ها
                </button>
                {Object.values(Category).map(cat => (
                <button 
                    key={cat}
                    onClick={() => setActiveFilter(cat)}
                    className={`py-3 px-2 rounded-xl text-xs font-medium text-center transition-colors border ${activeFilter === cat ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-200' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                    {cat}
                </button>
                ))}
            </div>
            </div>
        )}

        {/* Filters Row */}
        <div className="px-4 mb-2 flex flex-col gap-3">
             {/* Sort Tabs */}
             <div className="flex bg-white rounded-xl border border-gray-200 p-1 w-full">
                <button 
                onClick={() => setSortBy('NEWEST')}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${sortBy === 'NEWEST' ? 'bg-gray-100 text-gray-900 font-bold' : 'text-gray-500'}`}
                >
                جدیدترین‌ها
                </button>
                <button 
                onClick={() => setSortBy('NEAREST')}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${sortBy === 'NEAREST' ? 'bg-gray-100 text-gray-900 font-bold' : 'text-gray-500'}`}
                >
                نزدیک‌ترین‌ها
                </button>
            </div>

             {/* Distance Filter */}
             <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                {[null, 5, 10, 20, 50].map(dist => (
                    <button 
                        key={dist || 'all'} 
                        onClick={() => setMaxDistance(dist)}
                        className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${maxDistance === dist ? 'bg-primary-100 text-primary-700 border-primary-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                    >
                        {dist === null ? 'همه فاصله‌ها' : `کمتر از ${dist} کیلومتر`}
                    </button>
                ))}
            </div>
        </div>

        {/* Items Grid */}
        <div className="px-4 pt-2">
          <div className="flex justify-between items-center mb-3">
             <h2 className="font-bold text-gray-800">
                {isSearchMode ? `نتایج جستجو: "${searchQuery}"` : (maxDistance ? `آگهی‌های شعاع ${maxDistance} کیلومتری` : (sortBy === 'NEWEST' ? 'تازه‌های اطراف شما' : 'نزدیک‌ترین آگهی‌ها'))}
             </h2>
          </div>
          {sortedItems.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                  <Filter size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500 text-sm">هیچ آگهی با این مشخصات یافت نشد.</p>
                  <button onClick={() => {setMaxDistance(null); setActiveFilter('ALL'); setSearchQuery(''); }} className="text-primary-600 text-xs mt-2 font-bold">حذف فیلترها</button>
              </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
                {sortedItems.map(item => {
                const distance = calculateDistance(currentUserLocation.lat, currentUserLocation.lng, item.location.lat, item.location.lng).toFixed(1);
                return (
                    <div key={item.id} onClick={() => handleItemClick(item)} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden active:scale-95 transition-transform duration-150 flex flex-col cursor-pointer">
                    <div className="relative aspect-square bg-gray-200 w-full">
                        <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                        {item.status !== 'AVAILABLE' && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white font-bold text-sm uppercase px-2 py-1 border border-white rounded">
                                {item.status === 'RESERVED' ? 'رزرو شده' : 'اهدا شده'}
                            </span>
                        </div>
                        )}
                        <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm">
                        {item.condition}
                        </div>
                    </div>
                    <div className="p-3 flex flex-col flex-1">
                        <h3 className="font-bold text-gray-900 text-sm truncate mb-1">{item.title}</h3>
                        <div className="flex justify-between items-end mt-auto">
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 truncate w-20">{item.location.address}</span>
                            {(sortBy === 'NEAREST' || maxDistance) && (
                            <span className="text-[10px] text-primary-600 flex items-center gap-0.5 font-medium"><MapPin size={10}/> {distance} km</span>
                            )}
                        </div>
                        <span className="text-[10px] text-gray-400">{getPersianRelativeTime(item.createdAt)}</span>
                        </div>
                    </div>
                    </div>
                );
                })}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderRecentViews = () => (
    <div className="h-full bg-gray-50 flex flex-col">
        <div className="bg-white px-4 py-3 shadow-sm flex items-center gap-3 sticky top-0 z-10">
            <button onClick={() => setView('PROFILE')}><ArrowRight size={24}/></button>
            <h1 className="font-bold text-lg">بازدیدهای اخیر</h1>
        </div>
        <div className="flex-1 overflow-y-auto p-4 pb-24">
            {recentItems.length === 0 ? (
                <div className="text-center text-gray-500 mt-10 bg-white p-8 rounded-2xl shadow-sm">
                    <Eye size={48} className="mx-auto text-gray-300 mb-2"/>
                    <p>هنوز از هیچ آگهی بازدید نکرده‌اید.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {recentItems.map(item => (
                        <div key={item.id} onClick={() => handleItemClick(item)} className="bg-white p-3 rounded-xl shadow-sm flex gap-3 cursor-pointer active:scale-[0.98] transition-transform">
                             <img src={item.images[0]} className="w-20 h-20 rounded-lg object-cover bg-gray-200" alt={item.title} />
                             <div className="flex-1 flex flex-col justify-between">
                                 <div>
                                     <h3 className="font-bold text-gray-900 text-sm">{item.title}</h3>
                                     <div className="flex gap-2 mt-1">
                                        <span className={`text-[10px] px-2 py-0.5 rounded ${item.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {item.status === 'AVAILABLE' ? 'موجود' : item.status === 'RESERVED' ? 'رزرو شده' : 'اهدا شده'}
                                        </span>
                                        <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{item.condition}</span>
                                     </div>
                                 </div>
                                 <div className="flex justify-between items-end mt-2">
                                     <span className="text-xs text-gray-500">{item.city}</span>
                                     <span className="text-[10px] text-gray-400">{getPersianRelativeTime(item.createdAt)}</span>
                                 </div>
                             </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );

  const renderPostItem = () => (
    <div className="h-full bg-white flex flex-col">
      <div className="px-4 py-3 border-b flex items-center">
        <button onClick={() => setView('HOME')}><ArrowRight size={24} /></button>
        <h1 className="flex-1 text-center font-bold">ثبت آگهی رایگان</h1>
        <div className="w-6"></div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-24">
        <input 
           type="file" 
           accept="image/*" 
           ref={fileInputRef}
           onChange={handleFileChange}
           className="hidden"
        />

        {/* Image Upload Area */}
        <div>
          {newItemImages.length === 0 ? (
            <div onClick={handleImagePick} className="border-2 border-dashed border-gray-300 rounded-2xl h-48 flex flex-col items-center justify-center bg-gray-50 text-gray-500 cursor-pointer hover:bg-gray-100 transition-colors">
              <Camera size={40} className="mb-2" />
              <span className="text-sm font-medium">افزودن عکس</span>
              <span className="text-xs mt-1 text-gray-400">0/10 عکس</span>
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                <div onClick={handleImagePick} className="w-24 h-24 flex-shrink-0 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-50">
                    <Camera size={24} />
                    <span className="text-[10px] mt-1">افزودن</span>
                </div>
                {newItemImages.map((img, idx) => (
                    <div key={idx} className="relative w-24 h-24 flex-shrink-0 group">
                        <img src={img} alt="preview" className="w-full h-full object-cover rounded-xl border border-gray-200" />
                        <button 
                            onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm z-10"
                        >
                            <X size={12} />
                        </button>
                    </div>
                ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">عنوان آگهی</label>
          <input 
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" 
            placeholder="مثلاً: گلدان سفالی" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">وضعیت کالا</label>
          <div className="flex flex-wrap gap-2">
            {Object.values(ItemCondition).map(c => (
              <button 
                key={c} 
                onClick={() => setNewItemCondition(c)}
                className={`px-3 py-1.5 text-sm rounded-lg border ${newItemCondition === c ? 'bg-primary-50 border-primary-500 text-primary-700' : 'border-gray-200 text-gray-600'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">دسته‌بندی</label>
          <select 
            value={newItemCategory}
            onChange={(e) => setNewItemCategory(e.target.value as Category)}
            className="w-full p-3 border rounded-xl bg-white outline-none"
          >
            {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700">توضیحات</label>
            <button 
              onClick={generateAIContent}
              disabled={!newItemTitle || isGeneratingDesc}
              className="text-xs flex items-center gap-1 text-primary-600 hover:text-primary-700 disabled:text-gray-400"
            >
              <ImageIcon size={12} /> {isGeneratingDesc ? 'درحال نوشتن...' : 'نوشتن خودکار با هوش مصنوعی'}
            </button>
          </div>
          <textarea 
            value={newItemDesc}
            onChange={(e) => setNewItemDesc(e.target.value)}
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none resize-none" 
            placeholder="جزئیات کالا، زمان مناسب برای دریافت و ..."
            rows={8}
          ></textarea>
        </div>
        
        <div className="pt-4">
            <button 
            onClick={handlePostItem}
            disabled={!newItemTitle}
            className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold text-lg shadow-lg shadow-primary-200 disabled:opacity-50 disabled:shadow-none"
            >
            انتشار آگهی
            </button>
        </div>
      </div>
    </div>
  );

  const renderChatList = () => (
    <div className="h-full bg-white flex flex-col">
      <div className="px-4 py-3 border-b">
        <h1 className="font-bold text-xl">پیام‌ها</h1>
      </div>
      <div className="flex-1 overflow-y-auto pb-20">
        {chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
            <MessageCircle size={48} className="mb-4 text-gray-300" />
            <p>هیچ پیامی ندارید.</p>
            <p className="text-sm mt-2">برای شروع گفتگو، روی یک آگهی درخواست دهید.</p>
          </div>
        ) : (
            chats.map(chat => {
                const relatedItem = items.find(i => i.id === chat.itemId);
                return (
                    <div key={chat.id} onClick={() => { setSelectedChat(chat); setView('CHAT_DETAIL'); }} className="px-4 py-4 flex items-center gap-3 border-b border-gray-50 active:bg-gray-50 cursor-pointer">
                        <img src={relatedItem?.images[0] || 'https://via.placeholder.com/50'} className="w-12 h-12 rounded-lg object-cover bg-gray-100" alt="thumbnail" />
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-1">
                                <h3 className="font-bold text-sm text-gray-900 truncate">{relatedItem?.title || 'آیتم نامشخص'}</h3>
                                <span className="text-[10px] text-gray-400">12:30</span>
                            </div>
                            <p className="text-sm text-gray-500 truncate text-right">{chat.lastMessage || 'شروع گفتگو...'}</p>
                        </div>
                    </div>
                )
            })
        )}
      </div>
    </div>
  );

  const renderAdmin = () => (
      <div className="h-full bg-gray-50 flex flex-col">
          <div className="bg-white p-4 shadow-sm flex items-center gap-3 sticky top-0 z-10">
              <button onClick={() => setView('PROFILE')}><ArrowRight size={24}/></button>
              <h1 className="font-bold text-lg">پنل مدیریت</h1>
          </div>
          <div className="flex-1 overflow-y-auto pb-24">
            <div className="p-4 grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white p-4 rounded-xl shadow-sm">
                    <p className="text-gray-500 text-xs">در انتظار تایید</p>
                    <p className="text-2xl font-bold text-yellow-600">4</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm">
                    <p className="text-gray-500 text-xs">گزارشات</p>
                    <p className="text-2xl font-bold text-red-600">1</p>
                </div>
            </div>
            <div className="px-4">
                <h2 className="font-bold mb-2">آخرین آگهی‌ها (بررسی)</h2>
                <div className="space-y-3">
                    {items.map(item => (
                        <div key={item.id} className="bg-white p-3 rounded-xl shadow-sm flex gap-3">
                            <img src={item.images[0]} className="w-16 h-16 rounded-lg object-cover bg-gray-100" alt="thumb" />
                            <div className="flex-1">
                                <p className="font-bold text-sm">{item.title}</p>
                                <p className="text-xs text-gray-500 truncate">{item.description}</p>
                                <div className="flex gap-2 mt-2">
                                    <button className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded">تایید</button>
                                    <button className="text-[10px] bg-red-100 text-red-700 px-2 py-1 rounded">حذف</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </div>
      </div>
  )

  const renderMap = () => (
      <div className="h-full relative bg-gray-200">
          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-50 pointer-events-none select-none">
              {/* Visual fake map background */}
              <div className="w-full h-full bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] bg-gray-100"></div>
          </div>
          
          {/* Mock Pins */}
          {items.map((item, idx) => (
              <div 
                key={item.id} 
                className="absolute flex flex-col items-center cursor-pointer transform hover:scale-110 transition-transform z-10"
                style={{ top: `${20 + (idx * 15)}%`, right: `${20 + (idx * 20)}%` }}
                onClick={() => handleItemClick(item)}
              >
                  <div className="bg-white p-1 rounded-md shadow-md mb-1 whitespace-nowrap text-[10px] font-bold px-2">{item.title}</div>
                  <MapPin className="text-primary-600 drop-shadow-md" size={32} fill="currentColor" />
              </div>
          ))}

          <div className="absolute top-4 left-4 right-4 bg-white p-3 rounded-xl shadow-lg flex items-center z-20">
              <Search size={18} className="text-gray-400 ml-2"/>
              <input placeholder="جستجو در منطقه..." className="flex-1 outline-none text-sm" />
          </div>
          
          <div className="absolute bottom-24 left-4 z-20">
             <button className="bg-white p-3 rounded-full shadow-lg text-gray-700 mb-3"><MapPin size={24} /></button>
          </div>
      </div>
  )

  if (view === 'AUTH') return renderAuth();

  return (
    <div className="h-full w-full relative">
      {view === 'HOME' && renderHome()}
      {view === 'SEARCH' && renderHome()} 
      {view === 'POST_ITEM' && renderPostItem()}
      
      {view === 'ITEM_DETAIL' && selectedItem && (
        <ItemDetailView 
            item={selectedItem} 
            currentUser={user || undefined}
            similarItems={items.filter(i => i.category === selectedItem.category && i.id !== selectedItem.id)}
            onBack={() => setView('HOME')} 
            onChat={() => startChat(selectedItem)} 
            onReserve={() => handleReserveItem(selectedItem)}
            onItemClick={(newItem) => handleItemClick(newItem)}
        />
      )}
      
      {view === 'CHAT_LIST' && renderChatList()}
      
      {view === 'CHAT_DETAIL' && selectedChat && (
          <ChatDetailView 
            chat={selectedChat}
            item={items.find(i => i.id === selectedChat.itemId)}
            currentUser={user || undefined}
            onBack={() => setView('CHAT_LIST')}
            onSendMessage={sendMessage}
          />
      )}
      
      {view === 'PROFILE' && user && (
        <ProfileView 
            user={user}
            onUpdateProfile={handleUpdateProfile}
            onLogout={handleLogout}
            onChangeView={setView}
            onUpdateTrustScore={handleTrustScoreUpdate}
            currentUser={user}
        />
      )}
      
      {view === 'ADMIN' && renderAdmin()}
      {view === 'MAP' && renderMap()}
      {view === 'RECENT_VIEWS' && renderRecentViews()}

      {/* Conditionally render Navigation if we are on main tabs */}
      {['HOME', 'CHAT_LIST', 'PROFILE', 'MAP'].includes(view) && (
        <Navigation 
            currentView={view} 
            onChangeView={handleNavigation} 
            unreadCount={chats.reduce((acc, c) => acc + (c.lastMessage && c.participants[1] === user?.id ? 1 : 0), 0)} 
        />
      )}
    </div>
  );
}
