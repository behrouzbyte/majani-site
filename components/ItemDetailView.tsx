
import React, { useState, useEffect } from 'react';
import { ArrowRight, MapPin, Shield, AlertTriangle, Share2, Clock } from 'lucide-react';
import { Item, User } from '../types';
import * as GeminiService from '../services/geminiService';

interface ItemDetailViewProps {
    item: Item;
    currentUser?: User;
    similarItems: Item[];
    onBack: () => void;
    onChat: () => void;
    onReserve?: () => void;
    onItemClick: (item: Item) => void;
}

// Helper function for relative time (duplicated from App.tsx to keep components self-contained in this structure)
function getPersianRelativeTime(dateString: string): string {
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

export default function ItemDetailView({ item, currentUser, similarItems, onBack, onChat, onReserve, onItemClick }: ItemDetailViewProps) {
    const [safetyTips, setSafetyTips] = useState<string[]>([]);

    useEffect(() => {
        let mounted = true;
        GeminiService.suggestSafetyTips(item.title).then(tips => {
            if (mounted) setSafetyTips(tips);
        });
        return () => { mounted = false; };
    }, [item]);

    // Scroll to top when item changes
    useEffect(() => {
        const container = document.getElementById('item-detail-container');
        if (container) container.scrollTop = 0;
    }, [item.id]);

    const isOwner = currentUser?.id === item.userId;
    const showReserve = !isOwner && item.status === 'AVAILABLE';

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: item.title,
                text: item.description,
                url: window.location.href
            }).catch(console.error);
        } else {
            // Fallback for desktop/unsupported
            alert('لینک آگهی کپی شد (شبیه‌سازی)');
        }
    };

    return (
      <div className="h-full bg-white relative">
        <div id="item-detail-container" className="h-full overflow-y-auto pb-24 no-scrollbar scroll-smooth">
            <div className="relative h-72 bg-gray-200">
            <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
            <button onClick={onBack} className="absolute top-4 right-4 bg-white/80 p-2 rounded-full backdrop-blur-md text-gray-800 shadow-sm z-10">
                <ArrowRight size={20} />
            </button>
            <div className="absolute bottom-4 left-4 flex gap-2">
                <button className="bg-white/90 px-3 py-1 rounded-full text-xs font-bold text-gray-700 shadow-sm">
                {item.images.length} عکس
                </button>
            </div>
            </div>
            
            <div className="px-5 py-6">
            <div className="flex justify-between items-start mb-2">
                <div>
                <h1 className="text-2xl font-bold text-gray-900">{item.title}</h1>
                <div className="flex flex-wrap gap-2 mt-2 items-center">
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-md font-medium">رایگان</span>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md font-medium">{item.condition}</span>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-md font-medium">{item.category}</span>
                </div>
                </div>
            </div>

            <div className="flex items-center gap-1 text-gray-400 text-xs mb-4">
                <Clock size={12} />
                <span>{getPersianRelativeTime(item.createdAt)}</span>
            </div>
            
            <div className="flex items-center gap-3 py-4 border-t border-gray-100 mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden">
                     <img src={`https://ui-avatars.com/api/?name=User&background=random`} alt="avatar" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                <p className="font-bold text-sm text-gray-900">آگهی دهنده: کاربر {item.userId.substring(0, 5)}...</p>
                <p className="text-xs text-gray-500">عضو فعال</p>
                </div>
                <div className="flex items-center gap-1 text-yellow-500">
                    <span className="text-sm font-bold">5.0</span>
                    <span className="text-[10px] text-gray-400">(12)</span>
                </div>
            </div>

            <h3 className="font-bold text-gray-900 mb-2">توضیحات</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-6 text-justify whitespace-pre-wrap">
                {item.description}
            </p>
            
            <h3 className="font-bold text-gray-900 mb-2">موقعیت مکانی</h3>
            <div className="bg-gray-100 h-32 rounded-xl flex items-center justify-center text-gray-400 mb-6 relative overflow-hidden">
                {/* Mock Map Visual */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:16px_16px]"></div>
                <div className="z-10 flex flex-col items-center">
                <MapPin size={32} className="text-primary-600 mb-1" />
                <span className="text-xs font-medium text-gray-600">{item.location.address}</span>
                </div>
            </div>

            {safetyTips.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-xl mb-6">
                    <h4 className="font-bold text-blue-800 text-sm mb-2 flex items-center gap-2">
                        <Shield size={14}/> نکات ایمنی (هوش مصنوعی)
                    </h4>
                    <ul className="list-disc list-inside text-xs text-blue-700 space-y-1">
                        {safetyTips.map((tip, idx) => <li key={idx}>{tip}</li>)}
                    </ul>
                </div>
            )}

            <div className="flex gap-2 pb-6 border-b border-gray-100 mb-6">
                <button onClick={handleShare} className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors">
                    <Share2 size={18} />
                    اشتراک گذاری
                </button>
                <button onClick={() => alert('گزارش تخلف ثبت شد.')} className="flex-none w-12 flex items-center justify-center border border-red-200 text-red-500 rounded-xl hover:bg-red-50 transition-colors">
                    <AlertTriangle size={20} />
                </button>
            </div>

            {/* Similar Items Section */}
            {similarItems.length > 0 && (
                <div className="mb-6">
                    <h3 className="font-bold text-gray-900 mb-3">آگهی‌های مشابه</h3>
                    <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-5 px-5">
                        {similarItems.map(sim => (
                            <div 
                                key={sim.id} 
                                onClick={() => onItemClick(sim)}
                                className="w-36 flex-shrink-0 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm active:scale-95 transition-transform cursor-pointer"
                            >
                                <div className="h-36 w-full bg-gray-100 relative">
                                     <img src={sim.images[0]} className="w-full h-full object-cover" alt={sim.title} />
                                     <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1 rounded backdrop-blur-sm">{sim.condition}</span>
                                </div>
                                <div className="p-2">
                                    <p className="text-xs font-bold text-gray-800 truncate mb-1">{sim.title}</p>
                                    <p className="text-[10px] text-gray-500 truncate">{sim.city}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            </div>
        </div>

        <div className="absolute bottom-0 w-full p-4 bg-white border-t border-gray-100 shadow-lg z-20 flex gap-3">
            <button 
                onClick={onChat}
                className={`py-3.5 rounded-xl font-bold text-lg transition-all ${showReserve ? 'flex-1 bg-white border border-primary-600 text-primary-600 hover:bg-primary-50' : 'w-full bg-primary-600 text-white shadow-lg shadow-primary-200 hover:bg-primary-700'}`}
            >
                گفتگو
            </button>
            
            {showReserve && (
                <button 
                    onClick={onReserve}
                    className="flex-[2] bg-[#FF0000] hover:bg-red-700 text-[#FFFFFF] py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-red-200 transition-all"
                >
                    رزرو کالا
                </button>
            )}
        </div>
      </div>
    );
}
