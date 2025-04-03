import { toast } from 'sonner';

let camExtension: any;

export const initializeLovense = async (websiteName: string, modelName: string) => {
  try {
    // Load the Lovense broadcast SDK
    const script = document.createElement('script');
    script.src = "https://api.lovense-api.com/cam-extension/static/js-sdk/broadcast.js";
    script.async = true;
    document.body.appendChild(script);

    // Initialize after script loads
    script.onload = () => {
      // @ts-ignore - CamExtension is loaded globally
      camExtension = new window.CamExtension(websiteName, modelName);

      camExtension.on("ready", (ce: any) => {
        console.log("Lovense extension ready");
        setupEventListeners(ce);
      });

      camExtension.on("sdkError", (data: any) => {
        console.error("Lovense SDK error:", data.code, data.message);
        toast.error(`Lovense error: ${data.message}`);
      });
    };

    return camExtension;
  } catch (error) {
    console.error('Error initializing Lovense:', error);
    throw error;
  }
};

const setupEventListeners = (ce: any) => {
  ce.on("postMessage", (message: string) => {
    toast.info(message);
  });

  ce.on("toyStatusChange", (data: any) => {
    console.log("Toy status changed:", data);
  });

  ce.on("tipQueueChange", (data: any) => {
    console.log("Tip queue updated:", data);
  });

  ce.on("settingsChange", (data: any) => {
    console.log("Settings updated:", data);
  });
};

export const getSettings = async () => {
  if (!camExtension) return null;
  return await camExtension.getSettings();
};

export const getToyStatus = async () => {
  if (!camExtension) return [];
  return await camExtension.getToyStatus();
};

export const receiveTip = async (amount: number, tipperName: string) => {
  if (!camExtension) return;
  await camExtension.receiveTip(amount, tipperName);
};

export const receiveMessage = async (userName: string, content: string) => {
  if (!camExtension) return;
  await camExtension.receiveMessage(userName, content);
};

export const cleanup = () => {
  if (camExtension) {
    // Remove event listeners and cleanup
    camExtension.removeAllListeners();
    camExtension = null;
  }
};