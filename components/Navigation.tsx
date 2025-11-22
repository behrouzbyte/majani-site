import React from 'react';
import { Home, Search, PlusCircle, MessageCircle, User, Map as MapIcon } from 'lucide-react';
import { AppView } from '../types';

interface NavigationProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  unreadCount: number;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onChangeView, unreadCount }) => {
  const navItems = [
    { id: 'HOME', icon: Home, label: 'خانه' },
    { id: 'MAP', icon: MapIcon, label: 'نقشه' },
    { id: 'POST_ITEM', icon: PlusCircle, label: 'ثبت آگهی', isSpecial: true },
    { id: 'CHAT_LIST', icon: MessageCircle, label: 'چت', badge: unreadCount },
    { id: 'PROFILE', icon: User, label: 'حساب کاربری' },
  ];

  return (
    <div className="h-16 bg-white border-t border-gray-200 flex items-center justify-around px-2 pb-safe fixed bottom-0 w-full z-50 shadow-lg dir-rtl">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id || (item.id === 'HOME' && currentView === 'ITEM_DETAIL') || (item.id === 'CHAT_LIST' && currentView === 'CHAT_DETAIL');
        
        if (item.isSpecial) {
           return (
             <button
              key={item.id}
              onClick={() => onChangeView(item.id as AppView)}
              className="flex flex-col items-center justify-center -mt-6"
            >
              <div className="bg-primary-600 rounded-full p-3 shadow-lg shadow-primary-200 hover:bg-primary-700 transition-colors">
                <Icon size={28} className="text-white" />
              </div>
              <span className="text-xs font-medium text-gray-600 mt-1">{item.label}</span>
            </button>
           )
        }

        return (
          <button
            key={item.id}
            onClick={() => onChangeView(item.id as AppView)}
            className={`flex flex-col items-center justify-center w-16 py-1 relative ${isActive ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            {item.badge && item.badge > 0 && (
              <span className="absolute top-0 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] flex justify-center">
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default Navigation;