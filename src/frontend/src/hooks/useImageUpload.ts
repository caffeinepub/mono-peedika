import { ExternalBlob, createActor } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useState } from "react";

export function useImageUpload() {
  const { actor } = useActor(createActor);
  const [progress, setProgress] = useState<number | null>(null);

  async function uploadImage(file: File): Promise<string> {
    setProgress(0);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) =>
        setProgress(pct),
      );
      if (!actor) throw new Error("Actor not ready");
      return blob.getDirectURL();
    } finally {
      setProgress(null);
    }
  }

  return { uploadImage, progress };
}
