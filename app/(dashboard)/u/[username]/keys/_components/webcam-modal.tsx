"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, Volume2, VolumeX } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import {
  Room,
  RoomEvent,
  createLocalTracks,
  LocalTrack,
  LocalVideoTrack,
  Track,
  VideoPresets,
  RoomOptions,
  ConnectionState,
  RoomConnectOptions,
  DisconnectReason,
} from "livekit-client";
import { usePathname } from "next/navigation";

export const WebcamModal = () => {
  const { user } = useUser();
  const pathname = usePathname();
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const roomRef = useRef<Room | null>(null);
  const [localTracks, setLocalTracks] = useState<LocalTrack[]>([]);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const maxReconnectAttempts = 3;
  const reconnectAttemptRef = useRef(0);
  const isInitialMount = useRef(true);

  // Store stream state in sessionStorage
  const persistStreamState = (state: boolean) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('streamState', JSON.stringify({
        isStreaming: state,
        userId: user?.id
      }));
    }
  };

  // Get persisted stream state
  const getPersistedStreamState = () => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('streamState');
      if (stored) {
        const { isStreaming, userId } = JSON.parse(stored);
        return userId === user?.id ? isStreaming : false;
      }
    }
    return false;
  };

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isStreaming) {
        reconnectToStream();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isStreaming]);

  // Initialize stream state from storage
  useEffect(() => {
    if (isInitialMount.current) {
      const shouldStream = getPersistedStreamState();
      if (shouldStream) {
        startWebcamStream();
      }
      isInitialMount.current = false;
    }
  }, [user?.id]);

  // Handle pathname changes
  useEffect(() => {
    if (!isInitialMount.current && isStreaming) {
      reconnectToStream();
    }
  }, [pathname]);

  useEffect(() => {
    checkStreamStatus();
    const interval = setInterval(checkStreamStatus, 30000);
    
    return () => {
      clearInterval(interval);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      // Don't cleanup stream on unmount if we're just navigating
      if (!getPersistedStreamState()) {
        cleanupStream();
      }
    };
  }, [user?.id]);

  const checkStreamStatus = async () => {
    try {
      if (!user?.id) return;

      const response = await fetch("/api/stream/status/check");
      if (!response.ok) throw new Error("Failed to check stream status");
      
      const data = await response.json();
      
      if (data.isLive && !isStreaming && !isReconnecting) {
        setIsStreaming(true);
        persistStreamState(true);
        reconnectToStream();
      } else if (!data.isLive && isStreaming) {
        setIsStreaming(false);
        persistStreamState(false);
        cleanupStream();
      }
    } catch (error) {
      console.error("Error checking stream status:", error);
    }
  };

  const cleanupStream = () => {
    try {
      localTracks.forEach(track => {
        track.stop();
        track.detach();
      });
      setLocalTracks([]);

      if (videoRef.current) {
        const stream = videoRef.current.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        videoRef.current.srcObject = null;
      }

      if (roomRef.current) {
        roomRef.current.disconnect(true);
        roomRef.current = null;
      }

      reconnectAttemptRef.current = 0;
      persistStreamState(false);
    } catch (error) {
      console.error("Cleanup error:", error);
    }
  };

  const createStreamToken = async () => {
    try {
      if (!user?.id) throw new Error("User not authenticated");

      const response = await fetch("/api/stream/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get stream token");
      }

      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error("Token error:", error);
      throw error;
    }
  };

  const reconnectToStream = async () => {
    if (!isStreaming || isReconnecting || reconnectAttemptRef.current >= maxReconnectAttempts) {
      if (reconnectAttemptRef.current >= maxReconnectAttempts) {
        toast.error("Maximum reconnection attempts reached");
        setIsStreaming(false);
        persistStreamState(false);
        cleanupStream();
      }
      return;
    }

    try {
      setIsReconnecting(true);
      reconnectAttemptRef.current += 1;
      await startWebcamStream(true);
      reconnectAttemptRef.current = 0;
    } catch (error) {
      console.error("Reconnection error:", error);
      if (reconnectAttemptRef.current < maxReconnectAttempts) {
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectToStream();
        }, 2000 * Math.pow(2, reconnectAttemptRef.current));
      } else {
        setIsStreaming(false);
        persistStreamState(false);
        toast.error("Failed to reconnect after multiple attempts");
      }
    } finally {
      setIsReconnecting(false);
    }
  };

  const setupRoomListeners = (room: Room) => {
    room.on(RoomEvent.Disconnected, async (reason?: DisconnectReason) => {
      console.log("Disconnected with reason:", reason);
      
      if (isStreaming && reason !== DisconnectReason.CLIENT_INITIATED) {
        toast.info("Connection lost. Attempting to reconnect...");
        await reconnectToStream();
      } else {
        setIsStreaming(false);
        persistStreamState(false);
        cleanupStream();
        toast.info("Stream disconnected");
      }
    });

    room.on(RoomEvent.ConnectionStateChanged, (state: ConnectionState) => {
      console.log("Connection state changed:", state);
      
      if (state === ConnectionState.Connected) {
        toast.success("Stream connected");
        reconnectAttemptRef.current = 0;
      } else if (state === ConnectionState.Reconnecting) {
        toast.info("Attempting to reconnect...");
      }
    });

    room.on(RoomEvent.MediaDevicesError, (error: Error) => {
      console.error("Media device error:", error);
      toast.error("Media device error: " + error.message);
    });
  };

  const toggleAudio = () => {
    const audioTrack = localTracks.find(track => track.kind === Track.Kind.Audio);
    if (audioTrack) {
      if (isMuted) {
        audioTrack.unmute();
      } else {
        audioTrack.mute();
      }
      setIsMuted(!isMuted);
    }
  };

  const startWebcamStream = async (isReconnection = false) => {
    if (!user?.id) {
      toast.error("User not authenticated");
      return;
    }

    try {
      if (!isReconnection) {
        setIsLoading(true);
      }
      cleanupStream();

      const tracks = await createLocalTracks({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: {
          resolution: VideoPresets.h720.resolution,
          facingMode: 'user',
        }
      });

      const token = await createStreamToken();

      const roomOptions: RoomOptions = {
        adaptiveStream: true,
        dynacast: true,
        publishDefaults: {
          simulcast: true,
          videoSimulcastLayers: [
            VideoPresets.h540,
            VideoPresets.h720,
          ],
        },
        videoCaptureDefaults: {
          resolution: VideoPresets.h720.resolution,
        },
        stopLocalTrackOnUnpublish: false,
      };

      const room = new Room(roomOptions);
      setupRoomListeners(room);

      const connectOptions: RoomConnectOptions = {
        autoSubscribe: true,
        rtcConfig: {
          iceTransportPolicy: 'all',
          bundlePolicy: 'balanced',
          iceCandidatePoolSize: 10,
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ],
        },
      };

      await room.connect(process.env.NEXT_PUBLIC_LIVEKIT_WS_URL!, token, connectOptions);

      for (const track of tracks) {
        await room.localParticipant.publishTrack(track);
      }

      const videoTrack = tracks.find(
        track => track.kind === Track.Kind.Video
      ) as LocalVideoTrack;

      if (videoTrack && videoRef.current) {
        videoTrack.attach(videoRef.current);
      }

      roomRef.current = room;
      setLocalTracks(tracks);

      if (!isReconnection) {
        await fetch("/api/stream/status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isLive: true }),
        });

        setIsStreaming(true);
        persistStreamState(true);
        toast.success("Stream started successfully");
      }
    } catch (error) {
      console.error("Streaming error:", error);
      toast.error("Failed to start stream");
      cleanupStream();
      setIsStreaming(false);
      persistStreamState(false);
      throw error;
    } finally {
      if (!isReconnection) {
        setIsLoading(false);
      }
    }
  };

  const stopWebcamStream = async () => {
    try {
      cleanupStream();

      await fetch("/api/stream/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isLive: false }),
      });

      setIsStreaming(false);
      persistStreamState(false);
      toast.success("Stream ended");
    } catch (error) {
      console.error("Error stopping stream:", error);
      toast.error("Error ending stream");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <Camera className="h-4 w-4 mr-2" />
          Webcam Stream
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Stream from Webcam</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative aspect-video rounded-xl overflow-hidden bg-background">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {(isLoading || isReconnecting) && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="flex justify-between items-center">
            {isStreaming && (
              <Button
                onClick={toggleAudio}
                variant="ghost"
                size="sm"
                className="text-white"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
            )}
            
            <div className="flex-1 flex justify-end">
              {!isStreaming ? (
                <Button
                  onClick={() => startWebcamStream()}
                  disabled={isLoading}
                  variant="primary"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4 mr-2" />
                      Start Stream
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={stopWebcamStream}
                  variant="destructive"
                >
                  End Stream
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};