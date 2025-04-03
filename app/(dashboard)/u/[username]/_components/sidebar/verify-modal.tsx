"use client";

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface VerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const VerifyModal = ({ isOpen, onClose, onSuccess }: VerifyModalProps) => {
  const { user } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    birthDate: "",
    idFrontImage: "",
    idBackImage: "",
    selfieImage: "",
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasFrontRef = useRef<HTMLCanvasElement>(null);
  const canvasBackRef = useRef<HTMLCanvasElement>(null);
  const canvasSelfieRef = useRef<HTMLCanvasElement>(null);
  const [activeCamera, setActiveCamera] = useState<"front" | "back" | "selfie" | null>(null);
  const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('environment');

  useEffect(() => {
    if (!activeCamera) return;

    const initializeCamera = async () => {
      try {
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: activeCamera === 'selfie' ? 'user' : cameraFacingMode,
            ...(activeCamera === 'selfie' ? { 
              width: { ideal: 720 }, 
              height: { ideal: 720 } 
            } : {})
          }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        toast.error("Error accessing camera. Please check permissions.");
        setActiveCamera(null);
      }
    };

    initializeCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [activeCamera, cameraFacingMode]);

  const captureImage = (type: "front" | "back" | "selfie") => {
    const canvasMap = {
      front: canvasFrontRef.current,
      back: canvasBackRef.current,
      selfie: canvasSelfieRef.current
    };

    const canvas = canvasMap[type];
    const video = videoRef.current;

    if (!canvas || !video) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    if (type === 'selfie') {
      canvas.width = 720;
      canvas.height = 720;
    } else {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageKey = type === 'front' ? 'idFrontImage' 
      : type === 'back' ? 'idBackImage' 
      : 'selfieImage';

    setFormData(prev => ({
      ...prev,
      [imageKey]: canvas.toDataURL('image/jpeg', 0.8)
    }));

    if (video.srcObject) {
      const stream = video.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setActiveCamera(null);
  };

  const removeImage = (type: "front" | "back" | "selfie") => {
    const imageKey = type === 'front' ? 'idFrontImage' 
      : type === 'back' ? 'idBackImage' 
      : 'selfieImage';
    
    setFormData(prev => ({
      ...prev,
      [imageKey]: ""
    }));
  };

  const toggleCameraFacingMode = () => {
    setCameraFacingMode(prev => 
      prev === 'user' ? 'environment' : 'user'
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (!user) {
        toast.error("You must be logged in to verify");
        return;
      }

      const response = await fetch('/api/model-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          birthDate: formData.birthDate,
          idFrontImage: formData.idFrontImage,
          idBackImage: formData.idBackImage,
          selfieImage: formData.selfieImage
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Verification submission failed");
      }

      toast.success("Verification submitted successfully!");
      router.refresh();
      onClose();
      onSuccess?.();

    } catch (error) {
      console.error("Verification error:", error);
      toast.error(error instanceof Error ? error.message : "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-background max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Model Verification</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input
              placeholder="Legal name as on ID"
              value={formData.fullName}
              onChange={e => setFormData(p => ({ ...p, fullName: e.target.value }))}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Date of Birth</Label>
            <Input
              type="date"
              max={new Date().toISOString().split('T')[0]}
              value={formData.birthDate}
              onChange={e => setFormData(p => ({ ...p, birthDate: e.target.value }))}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Government ID Front</Label>
            {formData.idFrontImage ? (
              <div className="relative aspect-[3/2] rounded-lg border">
                <img 
                  src={formData.idFrontImage} 
                  alt="Front ID preview" 
                  className="object-cover w-full h-full"
                />
                <div className="absolute top-2 right-2 space-x-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setActiveCamera("front")}
                    variant="secondary"
                  >
                    Retake
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => removeImage("front")}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {activeCamera === "front" && (
                  <div className="space-y-2">
                    <div className="relative border rounded-lg overflow-hidden aspect-video">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        onClick={toggleCameraFacingMode}
                        className="absolute top-2 right-2"
                        variant="secondary"
                        size="sm"
                      >
                        {cameraFacingMode === 'user' ? 'Switch to Back Camera' : 'Switch to Front Camera'}
                      </Button>
                    </div>
                    <Button
                      type="button"
                      onClick={() => captureImage("front")}
                      className="w-full"
                    >
                      Capture Front ID
                    </Button>
                  </div>
                )}
                {!activeCamera && (
                  <Button
                    type="button"
                    onClick={() => setActiveCamera("front")}
                    className="w-full"
                    variant="secondary"
                  >
                    Take Front ID Photo
                  </Button>
                )}
                <canvas ref={canvasFrontRef} className="hidden" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Government ID Back</Label>
            {formData.idBackImage ? (
              <div className="relative aspect-[3/2] rounded-lg border">
                <img 
                  src={formData.idBackImage} 
                  alt="Back ID preview" 
                  className="object-cover w-full h-full"
                />
                <div className="absolute top-2 right-2 space-x-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setActiveCamera("back")}
                    variant="secondary"
                  >
                    Retake
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => removeImage("back")}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {activeCamera === "back" && (
                  <div className="space-y-2">
                    <div className="relative border rounded-lg overflow-hidden aspect-video">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        onClick={toggleCameraFacingMode}
                        className="absolute top-2 right-2"
                        variant="secondary"
                        size="sm"
                      >
                        {cameraFacingMode === 'user' ? 'Switch to Back Camera' : 'Switch to Front Camera'}
                      </Button>
                    </div>
                    <Button
                      type="button"
                      onClick={() => captureImage("back")}
                      className="w-full"
                    >
                      Capture Back ID
                    </Button>
                  </div>
                )}
                {!activeCamera && (
                  <Button
                    type="button"
                    onClick={() => setActiveCamera("back")}
                    className="w-full"
                    variant="secondary"
                  >
                    Take Back ID Photo
                  </Button>
                )}
                <canvas ref={canvasBackRef} className="hidden" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Selfie Verification</Label>
            {formData.selfieImage ? (
              <div className="relative aspect-square rounded-lg border">
                <img 
                  src={formData.selfieImage} 
                  alt="Selfie preview" 
                  className="object-cover w-full h-full"
                />
                <div className="absolute top-2 right-2 space-x-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setActiveCamera("selfie")}
                    variant="secondary"
                  >
                    Retake
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => removeImage("selfie")}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {activeCamera === "selfie" && (
                  <div className="space-y-2">
                    <div className="border rounded-lg overflow-hidden aspect-square">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={() => captureImage("selfie")}
                      className="w-full"
                    >
                      Capture Selfie
                    </Button>
                  </div>
                )}
                {!activeCamera && (
                  <Button
                    type="button"
                    onClick={() => setActiveCamera("selfie")}
                    className="w-full"
                    variant="secondary"
                  >
                    Take Selfie Photo
                  </Button>
                )}
                <canvas ref={canvasSelfieRef} className="hidden" />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || !formData.fullName || !formData.birthDate || 
                !formData.idFrontImage || !formData.idBackImage || !formData.selfieImage}
            >
              {isLoading ? "Submitting..." : "Submit Verification"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
