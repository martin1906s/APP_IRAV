import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Retos Mensuales: Colores y Reflexión Semanal con IA', () => {

  it('1. Regla de Colores: Completado (Amarillo/Oro) vs No completado (Rojo)', () => {
    // Simular estados de días
    const states = {
      1: 'completed',
      2: 'completed',
      3: 'missed',
      4: 'today',
      5: 'locked',
    };

    const getColorForState = (state) => {
      if (state === 'completed') return { color: 'Amarillo', hex: '#FFD700' };
      if (state === 'missed') return { color: 'Rojo', hex: '#EF4444' };
      if (state === 'today') return { color: 'Amarillo Hoy', hex: '#EAB308' };
      return { color: 'Gris', hex: '#3A3C44' };
    };

    assert.equal(getColorForState(states[1]).color, 'Amarillo', 'Reto completado debe ser amarillo');
    assert.equal(getColorForState(states[3]).color, 'Rojo', 'Reto no completado/missed debe ser rojo');
    console.log('   ✔ Días completados: Amarillo (#FFD700), Días no completados: Rojo (#EF4444)');
  });

  it('2. Reflexión Semanal con IA Gemini', async () => {
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    if (apiKey) {
      const prompt = `Actúa como pastor juvenil y mentor espiritual de IRAV.
El joven completó 5 de 7 días del reto semanal de oración y lectura.
Genera una reflexión semanal empática y motivadora de máximo 80 palabras con un versículo de aliento.`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });

      const json = await res.json();
      const reflection = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      assert.ok(reflection, 'Gemini debe responder con la reflexión semanal');
      console.log(`   ✔ IA Reflexión Semanal generada: "${reflection.trim().slice(0, 100)}..."`);
    } else {
      console.log('   ⚠ EXPO_PUBLIC_GEMINI_API_KEY no presente en entorno CLI.');
    }
  });
});
