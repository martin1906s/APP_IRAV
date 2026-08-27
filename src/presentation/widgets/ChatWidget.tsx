import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

/** Widget nativo: acceso rápido al chat con Jesús */
export function ChatWidget() {
  return (
    <FlexWidget
      clickAction="OPEN_URI"
      clickActionData={{ uri: 'irav://chat' }}
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#141414',
        borderRadius: 20,
        padding: 14,
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <TextWidget text="IRAV" style={{ fontSize: 12, color: '#FFFFFF' }} />
      <TextWidget
        text="Hablar con Jesús"
        style={{ fontSize: 18, color: '#FFFFFF', fontWeight: '700', marginTop: 4 }}
      />
      <TextWidget
        text="Escribe o graba. Te escucha."
        style={{ fontSize: 13, color: '#B3B3B3', marginTop: 6 }}
      />
    </FlexWidget>
  );
}
