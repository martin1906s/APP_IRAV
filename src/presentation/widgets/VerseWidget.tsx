import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import type { DailyInspiration } from '../../domain/entities/DailyInspiration';

type Props = {
  inspiration: DailyInspiration | null;
  needsMood: boolean;
};

/** Widget nativo: versículo + frase del día (o ánimo obligatorio) */
export function VerseWidget({ inspiration, needsMood }: Props) {
  if (needsMood || !inspiration) {
    return (
      <FlexWidget
        clickAction="OPEN_URI"
        clickActionData={{ uri: 'irav://mood' }}
        style={{
          height: 'match_parent',
          width: 'match_parent',
          backgroundColor: '#0B0B0B',
          borderRadius: 20,
          padding: 14,
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <TextWidget text="IRAV · Diario" style={{ fontSize: 12, color: '#FFFFFF', fontWeight: '600' }} />
        <TextWidget
          text="¿Cómo te sientes hoy?"
          style={{ fontSize: 18, color: '#FFFFFF', fontWeight: '700', marginTop: 8 }}
        />
        <TextWidget
          text="Toca para registrar tu ánimo (obligatorio cada día)."
          style={{ fontSize: 13, color: '#B3B3B3', marginTop: 8 }}
        />
      </FlexWidget>
    );
  }

  return (
    <FlexWidget
      clickAction="OPEN_URI"
      clickActionData={{ uri: 'irav://verse' }}
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#0B0B0B',
        borderRadius: 20,
        padding: 14,
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <TextWidget
        text="Versículo de hoy"
        style={{ fontSize: 12, color: '#FFFFFF', fontWeight: '600' }}
      />
      <TextWidget
        text={inspiration.phrase}
        style={{ fontSize: 13, color: '#E8E8E8', marginTop: 6 }}
      />
      <TextWidget
        text={`“${inspiration.verse.text}”`}
        style={{ fontSize: 14, color: '#FFFFFF', marginTop: 8 }}
      />
      <TextWidget
        text={`${inspiration.verse.reference} · ${inspiration.verse.versionId}`}
        style={{ fontSize: 12, color: '#B3B3B3', marginTop: 8 }}
      />
    </FlexWidget>
  );
}
