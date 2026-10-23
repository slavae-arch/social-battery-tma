import React, { useState } from 'react';
import { Room } from '../types';
import { INITIAL_ROOMS } from '../services/mockData';
import { getBatteryColor } from '../utils/battery';
import { Users, Flame, Plus, BellRing } from 'lucide-react';
import { telegram } from '../services/telegram';

interface RoomsTabProps {
  onHangoutCall: (room: Room, readyCount: number) => void;
  onAddBotToGroup: () => void;
}

export const RoomsTab: React.FC<RoomsTabProps> = ({ onHangoutCall, onAddBotToGroup }) => {
  const [rooms] = useState<Room[]>(INITIAL_ROOMS);
  const [selectedRoomId, setSelectedRoomId] = useState<string>(INITIAL_ROOMS[0].id);

  const activeRoom = rooms.find((r) => r.id === selectedRoomId) || rooms[0];
  const readyMembers = activeRoom.members.filter((m) => m.battery_level >= 70);

  const handleCallHangout = () => {
    telegram.hapticNotification('success');
    onHangoutCall(activeRoom, readyMembers.length);
  };

  return (
    <div className="w-full max-w-sm px-4 flex flex-col gap-4">
      {/* Add Bot to Group Banner */}
      <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
            <Users className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-200">Создать комнату чата</span>
            <span className="text-[10px] text-slate-400">Добавь бота в группу с друзьями</span>
          </div>
        </div>
        <button
          onClick={onAddBotToGroup}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Добавить</span>
        </button>
      </div>

      {/* Room Tabs Selector */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {rooms.map((room) => {
          const isSelected = room.id === selectedRoomId;
          const color = getBatteryColor(room.avg_battery);
          return (
            <button
              key={room.id}
              onClick={() => {
                telegram.hapticImpact('light');
                setSelectedRoomId(room.id);
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-bold border transition-all whitespace-nowrap ${
                isSelected
                  ? 'bg-slate-800 border-slate-600 text-white shadow-md'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{room.icon}</span>
              <span>{room.title}</span>
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: color }}
              />
            </button>
          );
        })}
      </div>

      {/* Selected Room Overview Card */}
      <div className="p-4 bg-slate-900/90 border border-slate-800/80 rounded-2xl flex flex-col gap-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{activeRoom.icon}</span>
            <div>
              <h4 className="font-extrabold text-sm text-white">{activeRoom.title}</h4>
              <p className="text-[11px] text-slate-400">{activeRoom.description}</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Средний заряд</span>
            <span
              className="text-lg font-black"
              style={{ color: getBatteryColor(activeRoom.avg_battery) }}
            >
              {activeRoom.avg_battery}%
            </span>
          </div>
        </div>

        {/* Energy bar of the company */}
        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${activeRoom.avg_battery}%`,
              backgroundColor: getBatteryColor(activeRoom.avg_battery),
            }}
          />
        </div>

        {/* Member cards */}
        <div className="flex flex-col gap-1.5 mt-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Участники комнаты ({activeRoom.members.length}):
          </span>

          <div className="flex flex-col gap-1.5">
            {activeRoom.members.map((member) => (
              <div
                key={member.id}
                className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-full p-0.5"
                    style={{ backgroundColor: getBatteryColor(member.battery_level) }}
                  >
                    {member.photo_url ? (
                      <img
                        src={member.photo_url}
                        alt={member.first_name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center font-bold text-[10px] text-white">
                        {member.first_name[0]}
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-slate-200">
                    {member.first_name}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">{member.mood_tag}</span>
                  <span
                    className="text-xs font-black"
                    style={{ color: getBatteryColor(member.battery_level) }}
                  >
                    {member.battery_level}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hangout Button */}
        <button
          onClick={handleCallHangout}
          disabled={readyMembers.length === 0}
          className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all disabled:opacity-50"
        >
          <Flame className="w-4 h-4 text-slate-950 fill-slate-950" />
          <span>Собрать тусовку (готовы {readyMembers.length})</span>
          <BellRing className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
