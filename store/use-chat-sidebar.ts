import { create } from "zustand";
export enum ChatVariant  {
    CHAT = 'CHAT',
    COMMUNITY = 'COMMUNITY'
}

type Props = {
    collapsed: boolean;
    onExpand: () => void;
    variant: ChatVariant;
    onCollapse: () => void;
    onChangeVariant: (variant: ChatVariant) => void;
}




export const useChatSidebar = create<Props>((set) => ({
    collapsed: false,
    variant: ChatVariant.CHAT,
    onChangeVariant: (variant) => set(() => ({ variant })),
    onExpand: () => set({ collapsed: false }),
    onCollapse: () => set({ collapsed: true })
}));