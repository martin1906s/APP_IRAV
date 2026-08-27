/** Puerto: captura de audio del micrófono */
export interface AudioCapturePort {
  start(): Promise<void>;
  stop(): Promise<{ uri: string; mimeType: string; base64: string } | null>;
  isRecording(): boolean;
}
