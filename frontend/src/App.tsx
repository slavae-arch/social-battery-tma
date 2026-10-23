import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { telegram } from './services/telegram';
import { Friend, MoodTag, PrivacyOption, DurationOption, UserProfile, Room } from './types';
import { INITIAL_FRIENDS } from './services/mockData';
import { getBatteryColor } from './utils/battery';
import { BatteryWidget } from './components/BatteryWidget';
import { BatterySlider } from './components/BatterySlider';
import { MoodTags } from './components/MoodTags';
import { DurationPicker } from './components/DurationPicker';
import { FriendsRadar } from './components/FriendsRadar';
import { FriendSheet } from './components/FriendSheet';
import { RoomsTab } from './components/RoomsTab';
import { StoriesShareModal } from './components/StoriesShareModal';
import { DevBanner } from './components/DevBanner';
import { Toast } from './components/Toast';
import { BatteryCharging, Users, Layers, Share2, Smartphone } from 'lucide-react';

export function App() {
  const tgUser = telegram.getUser();

  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: 1,
    telegram_id: tgUser.id,
    username: tgUser.username || '',
    first_name: tgUser.first_name,
    last_name: tgUser.last_name,
    photo_url: tgUser.photo_url,
    battery_level: 85,
    mood_tag: '🔋 В ресурсе',
    privacy: 'all',
    duration: '4h',
    updated_at: new Date().toISOString(),
  });

  const [activeTab, setActiveTab] = useState<'status' | 'radar' | 'rooms'>('status');
  const [friends, setFriends] = useState<Friend[]>(INITIAL_FRIENDS);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [isStoriesOpen, setIsStoriesOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'info' | 'match' } | null>(null);

  useEffect(() => {
    telegram.init();
  }, []);

  const showToast = (message: string, type: 'success' | 'info' | 'match' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleBatteryChange = (level: number) => {
    setUserProfile((prev) => ({ ...prev, battery_level: level }));
    if (level === 100 && userProfile.battery_level < 100) {
      telegram.hapticNotification('success');
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#6ee7b7', '#fef08a'],
      });
    }
  };

  const handleTagChange = (tag: MoodTag) => {
    setUserProfile((prev) => ({ ...prev, mood_tag: tag }));
    showToast(`Статус обновлен: ${tag}`);
  };

  const handleDurationChange = (duration: DurationOption) => {
    setUserProfile((prev) => ({ ...prev, duration }));
  };

  const handlePrivacyChange = (privacy: PrivacyOption) => {
    setUserProfile((prev) => ({ ...prev, privacy }));
    showToast(privacy === 'close_friends' ? 'Статус виден только близким ⭐️' : 'Статус виден всем друзьям');
  };

  const handleInviteFriend = () => {
    const inviteLink = `https://t.me/my_social_battery_bot?start=ref_${userProfile.telegram_id}`;
    navigator.clipboard.writeText(inviteLink);
    telegram.hapticNotification('success');
    showToast('Инвайт-ссылка скопирована! Отправь её друзьям 🚀');
  };

  const handleSendPing = (friend: Friend, message: string) => {
    setSelectedFriend(null);
    showToast(`Пинг отправлен для ${friend.first_name}: "${message}"`, 'info');
  };

  const handleToggleCloseFriend = (friendId: number) => {
    setFriends((prev) =>
      prev.map((f) => (f.id === friendId ? { ...f, is_close_friend: !f.is_close_friend } : f))
    );
    if (selectedFriend && selectedFriend.id === friendId) {
      setSelectedFriend((prev) => (prev ? { ...prev, is_close_friend: !prev.is_close_friend } : null));
    }
    showToast('Список близких друзей обновлен');
  };

  const handleHangoutCall = (room: Room, readyCount: number) => {
    showToast(`Оповещение отправлено! ${readyCount} друзей с зарядом >70% получили приглашение в "${room.title}" 🎉`);
  };

  const handleAddBotToGroup = () => {
    telegram.hapticImpact('medium');
    const groupAddUrl = `https://t.me/my_social_battery_bot?startgroup=true`;
    window.open(groupAddUrl, '_blank');
  };

  const handleAddToHomeScreen = () => {
    const success = telegram.addToHomeScreen();
    if (success) {
      showToast('Ярлык добавляется на рабочий стол 📱');
    } else {
      showToast('Доступно в нативном клиенте Telegram на телефоне');
    }
  };

  // Dev simulation helpers
  const handleSimulateSmartMatch = () => {
    telegram.hapticNotification('success');
    showToast('🔥 Умный матчинг! У тебя и @dima_sky сейчас заряд выше 85%! Бот предлагает пересечься ☕️', 'match');
  };

  const handleSimulateFriendUpdate = () => {
    setFriends((prev) =>
      prev.map((f) => ({
        ...f,
        battery_level: Math.floor(Math.random() * 90) + 10,
        updated_ago: 'только что',
      }))
    );
    showToast('Заряды друзей обновлены');
  };

  const currentColor = getBatteryColor(userProfile.battery_level);

  return (
    <div
      className="min-h-screen text-slate-100 flex flex-col items-center justify-between pb-20 relative overflow-x-hidden transition-colors duration-700"
      style={{
        background: `radial-gradient(ellipse at 50% 0%, ${currentColor}18 0%, #020617 75%)`,
      }}
    >
      {/* Toast Alert */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Dev Mode Banner for testing outside Telegram */}
      <DevBanner
        onSimulateSmartMatch={handleSimulateSmartMatch}
        onSimulateFriendUpdate={handleSimulateFriendUpdate}
      />

      {/* Header bar */}
      <header className="w-full max-w-sm px-4 pt-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-full p-0.5"
            style={{ backgroundColor: currentColor }}
          >
            {userProfile.photo_url ? (
              <img
                src={userProfile.photo_url}
                alt={userProfile.first_name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-white">
                {userProfile.first_name[0]}
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white leading-tight">
              {userProfile.first_name} {userProfile.last_name || ''}
            </span>
            <span className="text-[10px] text-slate-400">Социальная батарейка</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsStoriesOpen(true)}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 active:scale-95 transition-all"
            title="Stories"
          >
            <Share2 className="w-4 h-4 text-blue-400" />
          </button>
          <button
            onClick={handleAddToHomeScreen}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 active:scale-95 transition-all"
            title="На экран"
          >
            <Smartphone className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </header>

      {/* Main Tab Content */}
      <main className="w-full flex-1 flex flex-col items-center justify-start mt-2">
        {activeTab === 'status' && (
          <div className="w-full flex flex-col items-center animate-fadeIn">
            {/* Battery Widget */}
            <BatteryWidget
              level={userProfile.battery_level}
              moodTag={userProfile.mood_tag}
            />

            {/* Slider */}
            <BatterySlider
              level={userProfile.battery_level}
              onChange={handleBatteryChange}
            />

            {/* Mood Tags */}
            <MoodTags
              selectedTag={userProfile.mood_tag}
              onSelectTag={handleTagChange}
            />

            {/* Reset Duration & Privacy */}
            <DurationPicker
              duration={userProfile.duration}
              onChangeDuration={handleDurationChange}
              privacy={userProfile.privacy}
              onChangePrivacy={handlePrivacyChange}
            />

            {/* Quick Share Stories Button */}
            <div className="w-full max-w-sm px-4 mt-4 mb-3">
              <button
                onClick={() => setIsStoriesOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600/80 to-indigo-600/80 hover:from-blue-600 hover:to-indigo-600 text-white border border-blue-400/30 flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Поделиться своим статусом в Stories</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'radar' && (
          <div className="w-full flex flex-col items-center animate-fadeIn">
            <FriendsRadar
              friends={friends}
              onSelectFriend={(friend) => setSelectedFriend(friend)}
              onInviteFriend={handleInviteFriend}
            />
          </div>
        )}

        {activeTab === 'rooms' && (
          <div className="w-full flex flex-col items-center animate-fadeIn">
            <RoomsTab
              onHangoutCall={handleHangoutCall}
              onAddBotToGroup={handleAddBotToGroup}
            />
          </div>
        )}
      </main>

      {/* Bottom Sheet Modals */}
      <FriendSheet
        friend={selectedFriend}
        onClose={() => setSelectedFriend(null)}
        onSendPing={handleSendPing}
        onToggleCloseFriend={handleToggleCloseFriend}
      />

      {isStoriesOpen && (
        <StoriesShareModal
          user={userProfile}
          onClose={() => setIsStoriesOpen(false)}
          onCopied={() => showToast('Инвайт-ссылка скопирована!')}
        />
      )}

      {/* Floating Bottom Navigation Bar */}
      <nav className="fixed bottom-3 w-11/12 max-w-sm bg-slate-900/90 backdrop-blur-xl border border-slate-700/70 rounded-3xl p-1.5 shadow-2xl flex items-center justify-around z-40">
        {[
          { id: 'status' as const, label: 'Мой статус', icon: BatteryCharging },
          { id: 'radar' as const, label: 'Радар друзей', icon: Users, badge: friends.filter(f => f.battery_level >= 70).length },
          { id: 'rooms' as const, label: 'Комнаты', icon: Layers },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                telegram.hapticImpact('light');
                setActiveTab(tab.id);
              }}
              className={`flex-1 py-2 px-3 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all relative ${
                isActive
                  ? 'bg-slate-800/90 text-blue-400 font-bold shadow-inner'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {Boolean(tab.badge) && (
                  <span className="absolute -top-1.5 -right-2 bg-emerald-500 text-slate-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
export default App;
