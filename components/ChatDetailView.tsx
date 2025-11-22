import React, { useState } from 'react';
import { ArrowRight, MoreVertical, Camera, Send } from 'lucide-react';
import { ChatSession, Item, User } from '../types';

interface ChatDetailViewProps {
    chat: ChatSession;
    item?: Item;
    currentUser?: User;
    onBack: () => void;
    onSendMessage: (text: string) => void;
}

export default function ChatDetailView({ chat, item, currentUser, onBack, onSendMessage }: ChatDetailViewProps) {
    const [msgText, setMsgText] = useState('');

    const handleSend = () => {
        if (msgText.trim()) {
            onSendMessage(msgText);
            setMsgText('');
        }
    };

    return (
        <div className="h-full bg-gray-50 flex flex-col w-full absolute inset-0 z-50">
            <div className="bg-white px-4 py-3 border-b shadow-sm flex items-center gap-3">
                <button onClick={onBack}><ArrowRight size={24} /></button>
                <img src={item?.images[0]} className="w-8 h-8 rounded-md object-cover" alt="item" />
                <div className="flex-1">
                    <h3 className="font-bold text-sm">{item?.title}</h3>
                    <p className="text-xs text-green-600">موجود</p>
                </div>
                <button><MoreVertical size={20} className="text-gray-400" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="bg-yellow-50 p-3 rounded-lg text-xs text-yellow-800 border border-yellow-100 mb-4 text-center">
                    نکته ایمنی: هیچ‌گونه اطلاعات مالی را به اشتراک نگذارید. این کالا رایگان است.
                </div>
                {chat.messages.map(m => {
                    const isMe = m.senderId === currentUser?.id;
                    return (
                        <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${isMe ? 'bg-primary-600 text-white rounded-br-none' : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-none'}`}>
                                {m.text}
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="p-3 bg-white border-t flex items-center gap-2 pb-safe">
                <button className="p-2 text-gray-400"><Camera size={24} /></button>
                <input 
                    className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                    placeholder="پیام خود را بنویسید..."
                    value={msgText}
                    onChange={e => setMsgText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
                />
                <button 
                    onClick={handleSend} 
                    disabled={!msgText.trim()}
                    className="p-2 bg-primary-600 text-white rounded-full disabled:opacity-50 disabled:bg-gray-300 transform rotate-180"
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
}