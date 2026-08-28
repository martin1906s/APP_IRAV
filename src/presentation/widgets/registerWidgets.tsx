import React from 'react';
import { Platform } from 'react-native';
import { registerWidgetTaskHandler } from 'react-native-android-widget';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import {
  hasMoodTodayCached,
  readCachedInspiration,
} from '../../infrastructure/adapters/inspiration/CachedInspiration';
import { VerseWidget } from './VerseWidget';
import { ChatWidget } from './ChatWidget';

async function renderVerseWidget(props: WidgetTaskHandlerProps) {
  const hasMood = await hasMoodTodayCached();
  const inspiration = hasMood ? await readCachedInspiration() : null;
  props.renderWidget(
    <VerseWidget
      inspiration={inspiration}
      needsMood={!hasMood || !inspiration}
      width={props.widgetInfo.width}
      height={props.widgetInfo.height}
    />,
  );
}

async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const name = props.widgetInfo.widgetName;

  if (name === 'ChatWidget') {
    props.renderWidget(
      <ChatWidget width={props.widgetInfo.width} height={props.widgetInfo.height} />,
    );
    return;
  }

  if (name === 'VerseWidget') {
    await renderVerseWidget(props);
  }
}

/** Solo Android: registra handlers de widgets. */
export function registerIravWidgets() {
  if (Platform.OS !== 'android') return;
  registerWidgetTaskHandler(widgetTaskHandler);
}
