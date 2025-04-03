import { create } from "zustand";

type Props = {
    collapsed: boolean;
    onExpand: () => void;
    onCollapse: () => void;
}


export const useSidebar = create<Props>((set) => ({
    collapsed: false,
    onExpand: () => set({ collapsed: false }),
    onCollapse: () => set({ collapsed: true })
}));