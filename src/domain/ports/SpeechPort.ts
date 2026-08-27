/** Puerto: voz de salida */
export interface SpeechPort {
  speak(text: string): Promise<void>;
  stop(): Promise<void>;
}
