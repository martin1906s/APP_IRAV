import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import type { DailyInspiration } from '../../domain/entities/DailyInspiration';

type Props = {
  inspiration: DailyInspiration | null;
  needsMood: boolean;
  width?: number;
  height?: number;
};

function fontSize(width?: number, height?: number, base = 14) {
  if (!width || !height) return base;
  const scale = Math.min(width / 250, height / 140, 1.6);
  return Math.round(base * Math.max(scale, 0.85));
}

/** Widget nativo: versículo + frase del día (o ánimo obligatorio) */
export function VerseWidget({ inspiration, needsMood, width, height }: Props) {
  const titleSize = fontSize(width, height, 12);
  const bodySize = fontSize(width, height, 13);
  const verseSize = fontSize(width, height, 14);
  const compact = (height ?? 140) < 120;

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
        <TextWidget
          text="IRAV · Diario"
          style={{ fontSize: titleSize, color: '#FFFFFF', fontWeight: '600' }}
        />
        <TextWidget
          text="¿Cómo te sientes hoy?"
          style={{ fontSize: bodySize + 4, color: '#FFFFFF', fontWeight: '700', marginTop: 8 }}
        />
        {!compact ? (
          <TextWidget
            text="Toca para registrar tu ánimo."
            style={{ fontSize: bodySize, color: '#B3B3B3', marginTop: 8 }}
          />
        ) : null}
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
        style={{ fontSize: titleSize, color: '#FFFFFF', fontWeight: '600' }}
      />
      <TextWidget
        text={inspiration.phrase}
        style={{ fontSize: bodySize, color: '#E8E8E8', marginTop: 6 }}
        maxLines={compact ? 2 : 3}
      />
      {!compact ? (
        <TextWidget
          text={`"${inspiration.verse.text}"`}
          style={{ fontSize: verseSize, color: '#FFFFFF', marginTop: 8 }}
          maxLines={4}
        />
      ) : null}
      <TextWidget
        text={`${inspiration.verse.reference} · ${inspiration.verse.versionId}`}
        style={{ fontSize: titleSize, color: '#B3B3B3', marginTop: 8 }}
      />
    </FlexWidget>
  );
}
