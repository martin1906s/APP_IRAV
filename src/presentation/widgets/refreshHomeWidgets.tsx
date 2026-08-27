import React from 'react';
import { Platform } from 'react-native';
import { requestWidgetUpdate } from 'react-native-android-widget';
import type { DailyInspiration } from '../../domain/entities/DailyInspiration';
import { VerseWidget } from '../../presentation/widgets/VerseWidget';
import { ChatWidget } from '../../presentation/widgets/ChatWidget';

/** Refresca widgets en el launcher Android. */
export async function refreshHomeWidgets(inspiration: DailyInspiration | null) {
  if (Platform.OS !== 'android') return;

  const needsMood = !inspiration;
  try {
    await requestWidgetUpdate({
      widgetName: 'VerseWidget',
      renderWidget: () => <VerseWidget inspiration={inspiration} needsMood={needsMood} />,
    });
    await requestWidgetUpdate({
      widgetName: 'ChatWidget',
      renderWidget: () => <ChatWidget />,
    });
  } catch {
    // En Expo Go los widgets nativos no existen todavía.
  }
}
