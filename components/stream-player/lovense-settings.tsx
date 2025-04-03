"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { initializeLovense, getSettings, getToyStatus } from '@/lib/lovense-service';

interface LovenseSettingsProps {
  userId: string;
  username: string;
}

export const LovenseSettings = ({
  userId,
  username
}: LovenseSettingsProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [toyStatus, setToyStatus] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await initializeLovense("SpectraHub", username);
      
      // Get initial toy status and settings
      const status = await getToyStatus();
      const config = await getSettings();
      
      setToyStatus(status || []);
      setSettings(config);
      
      toast.success("Lovense connected successfully!");
    } catch (error) {
      console.error("Lovense connection error:", error);
      toast.error("Failed to connect Lovense");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-2">Lovense Integration</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Connect your Lovense device to receive interactive tips
        </p>
      </div>

      <div className="space-y-4">
        <Button
          onClick={handleConnect}
          disabled={isConnecting}
          variant="primary"
        >
          {isConnecting ? "Connecting..." : "Connect Lovense"}
        </Button>

        {toyStatus.length > 0 && (
          <div className="mt-4">
            <h3 className="text-md font-semibold mb-2">Connected Toys</h3>
            <div className="space-y-2">
              {toyStatus.map((toy) => (
                <div 
                  key={toy.id}
                  className="p-3 bg-background rounded-lg border border-white/10"
                >
                  <p>Type: {toy.type}</p>
                  <p>Status: {toy.status}</p>
                  {toy.battery && <p>Battery: {toy.battery}%</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {settings && (
          <div className="mt-4">
            <h3 className="text-md font-semibold mb-2">Tip Settings</h3>
            <div className="space-y-2">
              {Object.entries(settings.levels || {}).map(([level, config]: [string, any]) => (
                <div 
                  key={level}
                  className="p-3 bg-background rounded-lg border border-white/10"
                >
                  <p className="font-medium">{level}</p>
                  <p>Range: {config.min} - {config.max} tokens</p>
                  <p>Duration: {config.time}s</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};