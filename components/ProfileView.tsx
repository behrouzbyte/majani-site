import React, { useState, useEffect } from 'react';
import { Camera, Edit2, Check, MapPin, User as UserIcon, Calendar, CheckCircle, Shield, ArrowRight, LogOut, Eye } from 'lucide-react';
import { User, AppView } from '../types';

interface ProfileViewProps {
    user: User;
    currentUser?: User;
    onUpdateProfile: (updates: Partial<User>) => Promise<void>;
    onLogout: () => void;
    onChangeView: (view: AppView) => void;
    onUpdateTrustScore?: (userId: string, newScore: number) => Promise<void>;
}

export default function ProfileView({ user, currentUser, onUpdateProfile, onLogout, onChangeView, onUpdateTrustScore }: ProfileViewProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<Partial<User>>({});

    // Initialize edit form
    useEffect(() => {
        if(isEditing) {
            setEditForm({
                name: user.name,
                bio: user.bio,
                email: user.email,
                city: user.city,
                address: user.address
            });
        }
    }, [isEditing, user]);

    const saveProfile = async () => {
        await onUpdateProfile(editForm);
        setIsEditing(false);
    };

    return (
        <div className="h-full bg-gray-50 overflow-y-auto pb-24">
            {/* Header / Cover */}
            <div className="bg-white pb-6 rounded-b-[2.5rem] shadow-sm mb-4 relative overflow-hidden border-b border-gray-100">
                <div className="absolute top-0 w-full h-32 bg-gradient-to-b from-primary-50 to-white"></div>
                
                <div className="relative z-10 px-6 pt-12">
                    <div className="flex justify-between items-start mb-4">
                        <div className="relative">
                           <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-200">
                              <img src={user.avatar} className="w-full h-full object-cover" alt="avatar" />
                           </div>
                           {isEditing && (
                               <div className="absolute bottom-0 right-0 bg-primary-600 p-1.5 rounded-full text-white border-2 border-white">
                                   <Camera size={14}/>
                               </div>
                           )}
                        </div>
                        {!isEditing ? (
                            <button onClick={() => setIsEditing(true)} className="bg-gray-100 p-2 rounded-xl text-gray-600 hover:bg-gray-200 transition-colors">
                                <Edit2 size={18} />
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button onClick={() => setIsEditing(false)} className="bg-gray-100 p-2 rounded-xl text-gray-600">انصراف</button>
                                <button onClick={saveProfile} className="bg-primary-600 text-white p-2 rounded-xl flex gap-1 items-center px-3 shadow-lg shadow-primary-200">
                                    <Check size={16} /> ذخیره
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {!isEditing ? (
                      <>
                          <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                          <p className="text-gray-500 text-sm mt-1 flex items-center gap-1"><MapPin size={14}/> {user.city}</p>
                          {user.bio && <p className="text-gray-600 text-sm mt-3 bg-gray-50 p-3 rounded-xl border border-gray-100 leading-relaxed">{user.bio}</p>}
                      </>
                    ) : (
                        <div className="space-y-3 mt-2">
                            <input className="w-full border-b border-gray-300 py-1 bg-transparent font-bold text-lg focus:border-primary-500 outline-none" 
                                value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} placeholder="نام"/>
                            <input className="w-full border-b border-gray-300 py-1 bg-transparent text-sm focus:border-primary-500 outline-none" 
                                value={editForm.city || ''} onChange={e => setEditForm({...editForm, city: e.target.value})} placeholder="شهر"/>
                            <textarea className="w-full border p-2 rounded-lg text-sm focus:border-primary-500 outline-none mt-2" 
                                value={editForm.bio || ''} onChange={e => setEditForm({...editForm, bio: e.target.value})} placeholder="بیوگرافی خود را بنویسید..." rows={3}/>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="px-4 mb-6">
              <div className="bg-white rounded-2xl shadow-sm p-4 flex justify-between text-center border border-gray-100 divide-x divide-x-reverse divide-gray-100">
                  <div className="flex-1">
                      <div className="text-2xl font-bold text-primary-600">{user.donatedCount}</div>
                      <div className="text-[10px] text-gray-400 uppercase font-bold">اهدا شده</div>
                  </div>
                  <div className="flex-1">
                      <div className="text-2xl font-bold text-secondary-600">{user.receivedCount}</div>
                      <div className="text-[10px] text-gray-400 uppercase font-bold">دریافت شده</div>
                  </div>
                  <div className="flex-1">
                      <div className={`text-2xl font-bold ${user.trustScore > 80 ? 'text-green-600' : 'text-yellow-600'}`}>{user.trustScore}</div>
                      <div className="text-[10px] text-gray-400 uppercase font-bold">امتیاز اعتماد</div>
                  </div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="px-4 space-y-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 font-bold text-gray-800 flex items-center gap-2">
                        <UserIcon size={18} className="text-primary-600"/> اطلاعات حساب
                    </div>
                    <div className="p-4 space-y-4 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">شماره موبایل</span>
                            <span className="font-medium dir-ltr text-gray-800">{user.phone}</span>
                        </div>
                        {user.email && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">ایمیل</span>
                              {isEditing ? (
                                  <input className="border-b text-left" value={editForm.email || ''} onChange={e => setEditForm({...editForm, email: e.target.value})}/>
                              ) : (
                                  <span className="font-medium text-gray-800">{user.email}</span>
                              )}
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span className="text-gray-500">تاریخ عضویت</span>
                            <span className="font-medium text-gray-800">{user.joinedDate}</span>
                        </div>
                         {user.address && (
                            <div className="flex flex-col gap-1">
                              <span className="text-gray-500">آدرس کوتاه (جهت تماس)</span>
                              {isEditing ? (
                                  <input className="border-b w-full" value={editForm.address || ''} onChange={e => setEditForm({...editForm, address: e.target.value})}/>
                              ) : (
                                  <span className="font-medium text-gray-800 text-sm">{user.address}</span>
                              )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pb-4">
                  <button className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between text-gray-700">
                      <span className="flex items-center gap-3"><Calendar size={20} className="text-gray-400"/> آگهی‌های فعال من</span>
                      <ArrowRight size={16} className="text-gray-400 rotate-180"/>
                  </button>
                  <button className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between text-gray-700">
                      <span className="flex items-center gap-3"><CheckCircle size={20} className="text-gray-400"/> تاریخچه اهدا</span>
                      <ArrowRight size={16} className="text-gray-400 rotate-180"/>
                  </button>
                  
                  <button 
                    onClick={() => onChangeView('RECENT_VIEWS')}
                    className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between text-gray-700"
                  >
                      <span className="flex items-center gap-3"><Eye size={20} className="text-gray-400"/> بازدیدهای اخیر (۲۰ مورد)</span>
                      <ArrowRight size={16} className="text-gray-400 rotate-180"/>
                  </button>

                  {user.isAdmin && (
                      <button onClick={() => onChangeView('ADMIN')} className="w-full bg-gray-900 text-white p-4 rounded-xl shadow-lg flex items-center justify-between mt-4">
                          <span className="flex items-center gap-3"><Shield size={20}/> پنل مدیریت</span>
                      </button>
                  )}

                  <button 
                      onClick={onLogout}
                      className="w-full bg-red-50 text-red-600 p-4 rounded-xl flex items-center justify-center gap-2 mt-6 font-bold"
                  >
                      <LogOut size={20} /> خروج از حساب
                  </button>
                  <p className="text-center text-xs text-gray-300 mt-4">نسخه ۱.۰.۰ - اپلیکیشن مجانی</p>
                </div>
            </div>
        </div>
    )
}