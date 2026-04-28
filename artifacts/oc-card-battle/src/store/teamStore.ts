import { create } from 'zustand';

interface TeamState {
  selectedCharacterIds: string[];
  addCharacter: (id: string) => void;
  removeCharacter: (id: string) => void;
  isFull: () => boolean;
}

export const useTeamStore = create<TeamState>((set, get) => ({
  selectedCharacterIds: [],
  addCharacter: (id) => set((state) => {
    if (state.selectedCharacterIds.length >= 3 || state.selectedCharacterIds.includes(id)) {
      return state;
    }
    return { selectedCharacterIds: [...state.selectedCharacterIds, id] };
  }),
  removeCharacter: (id) => set((state) => ({
    selectedCharacterIds: state.selectedCharacterIds.filter(charId => charId !== id)
  })),
  isFull: () => get().selectedCharacterIds.length >= 3
}));
