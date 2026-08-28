import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

type Props = {
  width?: number;
  height?: number;
};

/** Widget nativo: acceso rápido al chat con Jesús */
export function ChatWidget({ width, height }: Props) {
  const titleSize = width && height ? Math.round(Math.min(width / 18, height / 10, 18)) : 18;
  const bodySize = width && height ? Math.round(Math.min(width / 22, height / 12, 13)) : 13;
  const compact = (height ?? 110) < 100;

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
      <TextWidget text="IRAV" style={{ fontSize: bodySize, color: '#FFFFFF' }} />
      <TextWidget
        text={compact ? 'Jesús' : 'Hablar con Jesús'}
        style={{ fontSize: titleSize, color: '#FFFFFF', fontWeight: '700', marginTop: 4 }}
      />
      {!compact ? (
        <TextWidget
          text="Escribe o graba. Te escucha."
          style={{ fontSize: bodySize, color: '#B3B3B3', marginTop: 6 }}
        />
      ) : null}
    </FlexWidget>
  );
}
