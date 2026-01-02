import { create } from "zustand";

export const enum USER_ACTIONS {
    SELECT_MENU = "SELECT_MENU",
}

interface MenuFilterState {
    selected: { [key: string]: any } | null; // Hoặc thay 'any' bằng kiểu cụ thể
    action: USER_ACTIONS | null;
    isLoading: boolean;
    setSelected: (menu: { [key: string]: any }) => void;
    setAction: (value: USER_ACTIONS) => void;
    setIsLoading: (value: boolean) => void;
    requestAction: (action: USER_ACTIONS, menu: { [key: string]: any }) => void;
    clear: () => void;
}

const useMenuSelectedStore = create<MenuFilterState>((set, get) => ({
    isLoading: false,
    setIsLoading: (value) => set({ isLoading: value }),
    selected: null,
    setSelected: (value: { [key: string]: any }) => set(() => ({ selected: value })),
    action: null,
    setAction: (value: USER_ACTIONS) => set(() => ({ action: value })),
    requestAction: (action: USER_ACTIONS, menu: { [key: string]: any }) => {
        set(() => ({ selected: menu }));
        set(() => ({ action: action }));
    },
    clear: () => {
        set(() => ({ selected: null }));
        set(() => ({ action: null }));
    },
}));

export default useMenuSelectedStore;
