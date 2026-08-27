import {
  AudioModule,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
} from 'expo-audio';
import type { AudioRecorder } from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import type { AudioCapturePort } from '../../../domain/ports/AudioCapturePort';

/** Adaptador: grabación de micrófono */
export class ExpoAudioAdapter implements AudioCapturePort {
  private recording: AudioRecorder | null = null;

  isRecording() {
    return !!this.recording;
  }

  async start() {
    const permission = await requestRecordingPermissionsAsync();
    if (!permission.granted) {
      throw new Error('Permiso de micrófono denegado');
    }

    await setAudioModeAsync({
      allowsRecording: true,
      playsInSilentMode: true,
    });

    const rec = new AudioModule.AudioRecorder(RecordingPresets.HIGH_QUALITY);
    await rec.prepareToRecordAsync();
    rec.record();
    this.recording = rec;
  }

  async stop() {
    if (!this.recording) return null;

    await this.recording.stop();
    const uri = this.recording.uri;
    this.recording = null;

    await setAudioModeAsync({ allowsRecording: false });

    if (!uri) return null;

    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const mimeType = uri.toLowerCase().endsWith('.webm') ? 'audio/webm' : 'audio/mp4';
    return { uri, mimeType, base64 };
  }
}
