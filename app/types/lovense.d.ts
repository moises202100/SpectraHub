interface LovenseMessageEvent {
    type: 'message' | 'settings' | 'toy' | 'tipQueueStatus' | 'tipRunning';
    detail: any;
  }
  
  interface LovenseToy {
    id: string;
    name: string;
    status: string;
    type: string;
  }
  
  interface LovenseSettings {
    levels: {
      [key: string]: {
        min: string;
        max: string;
        time: string;
        rLevel: number;
        vLevel: number;
      };
    };
    special: {
      earthquake: {
        time: string;
        token: string;
      };
      fireworks: any;
      giveControl: any;
      pause: any;
      pulse: any;
      random: any;
      twowaves: any;
      wave: any;
    };
  }
  
  interface Lovense {
    initCamApi: (mToken: string) => void;
    destroyCamApi: () => void;
    receiveTip: (username: string, amount: number) => void;
    getToys: () => LovenseToy[];
    getSettings: () => LovenseSettings;
    addMessageListener: (callback: (event: LovenseMessageEvent) => void) => void;
  }
  
  interface Window {
    Lovense?: Lovense;
  }