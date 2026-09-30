import React, { useState } from 'react';
import { GameItem, ItemType } from '../types/game';
import { ITEMS_DATABASE } from '../game/levelsData';
import { X, Crown, Sparkles, Feather, Shield, Sword, Zap, Hammer, Flame, Bot, Sun, Cat, Clock, Check, Lock } from 'lucide-react';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  unlockedItemIds: string[];
  equippedHat: string | null;
  equippedWeapon: string | null;
  equippedCompanion: string | null;
  currentLevel: number;
  onEquipItem: (item: GameItem) => void;
  onUnequipItem: (type: ItemType) => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  isOpen,
  onClose,
  unlockedItemIds,
  equippedHat,
  equippedWeapon,
  equippedCompanion,
  currentLevel,
  onEquipItem,
  onUnequipItem
}) => {
  const [activeTab, setActiveTab] = useState<'ALL' | ItemType>('ALL');

  if (!isOpen) return null;

  const filteredItems = ITEMS_DATABASE.filter(item => {
    if (activeTab === 'ALL') return true;
    return item.type === activeTab;
  });

  const getItemIcon = (name: string, type: ItemType) => {
    switch (type) {
      case 'CROWN':
        return <Crown className="w-5 h-5 text-amber-400" />;
      case 'HAT':
        return <Feather className="w-5 h-5 text-sky-400" />;
      case 'WEAPON':
        return <Sword className="w-5 h-5 text-rose-400" />;
      case 'COMPANION':
        return <Bot className="w-5 h-5 text-emerald-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-yellow-400" />;
    }
  };

  const isEquipped = (item: GameItem) => {
    if (item.type === 'CROWN' || item.type === 'HAT') {
      return equippedHat === item.id;
    }
    if (item.type === 'WEAPON') {
      return equippedWeapon === item.id;
    }
    if (item.type === 'COMPANION') {
      return equippedCompanion === item.id;
    }
    return false;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-400" />
              Gifts & Royal Inventory
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Unlock prestigious Crowns, Hats, Weapons, and Companions as you advance through the 100 levels.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 px-6 py-2.5 bg-slate-950/60 border-b border-slate-800 overflow-x-auto scrollbar-none">
          {(['ALL', 'CROWN', 'HAT', 'WEAPON', 'COMPANION'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                activeTab === tab 
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'ALL' ? 'All Gifts' : tab === 'CROWN' ? 'Crowns & Taj' : tab === 'HAT' ? 'Headgear' : tab === 'WEAPON' ? 'Weapons' : 'Companions'}
            </button>
          ))}
        </div>

        {/* Item Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {filteredItems.map(item => {
            const isUnlocked = unlockedItemIds.includes(item.id) || currentLevel >= item.levelUnlocked;
            const equipped = isEquipped(item);

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  equipped
                    ? 'bg-slate-800/80 border-sky-500/70 shadow-lg shadow-sky-500/10'
                    : isUnlocked
                    ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-950/40 border-slate-900/60 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                        {getItemIcon(item.name, item.type)}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white tracking-tight">{item.name}</h4>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <span style={{ color: item.color }}>{item.rarity}</span>
                          <span aria-hidden="true">·</span>
                          <span>Level {item.levelUnlocked}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 mb-2">{item.description}</p>

                  <div className="text-[11px] text-emerald-400 font-medium bg-emerald-950/30 px-2 py-1 rounded-lg border border-emerald-900/40 mb-3">
                    Bonus: {item.bonus}
                  </div>
                </div>

                <div>
                  {isUnlocked ? (
                    equipped ? (
                      <button
                        onClick={() => onUnequipItem(item.type)}
                        className="w-full py-1.5 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/40 text-xs font-semibold flex items-center justify-center gap-1 hover:bg-sky-500/30 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Equipped (Click to Unequip)
                      </button>
                    ) : (
                      <button
                        onClick={() => onEquipItem(item)}
                        className="w-full py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-semibold transition-colors"
                      >
                        Equip Item
                      </button>
                    )
                  ) : (
                    <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 py-1.5 bg-slate-950/60 rounded-xl border border-slate-900">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Unlocks at Level {item.levelUnlocked}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
