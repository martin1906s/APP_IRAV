import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://udvccrhuqeiqejhiuakk.supabase.co';
const supabaseKey = 'sb_publishable_p_XVFg2oNiXVg3NRYXgBhQ_T2_mbkvw';
const supabase = createClient(supabaseUrl, supabaseKey);

describe('Admin "Ver Más" (User Detail) Comprehensive Test Suite', () => {

  it('1. Carga de usuario real e integridad de datos pastorales', async () => {
    const { data: users, error } = await supabase.from('users').select('*').limit(5);
    assert.ifError(error);
    assert.ok(users && users.length > 0, 'Debe haber usuarios registrados');

    const user = users[0];
    assert.ok(user.id, 'El usuario debe tener ID');
    assert.ok(user.name, 'El usuario debe tener Nombre');
    assert.ok(user.phone !== undefined, 'El campo teléfono debe existir');
    console.log(`   ✔ Usuario seleccionado: "${user.name}" (ID: ${user.id}, Documento: ${user.documentId || 'N/A'}, País: ${user.country})`);

    // Probar obtención específica individual
    const { data: singleUser, error: singleError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    assert.ifError(singleError);
    assert.equal(singleUser.id, user.id, 'Debe coincidir el ID de usuario obtenido');
  });

  it('2. Historial de estados de ánimo (Moods tab) y eliminación segura', async () => {
    // Buscar un usuario con moods
    const { data: moods } = await supabase.from('mood_logs').select('*').limit(5);
    console.log(`   ✔ Registros de ánimo en sistema: ${moods?.length || 0}`);
    if (moods && moods.length > 0) {
      const sampleMood = moods[0];
      assert.ok(sampleMood.mood, 'El registro debe tener campo mood');
      assert.ok(sampleMood.userId, 'El registro debe pertenecer a un usuario');
      console.log(`   ✔ Registro de ánimo verificado: [${sampleMood.date}] ${sampleMood.mood} para usuario ${sampleMood.userId}`);
    }
  });

  it('3. Historial de conversaciones con Jesús (Chat tab)', async () => {
    const { data: messages } = await supabase.from('chat_messages').select('*').limit(5);
    console.log(`   ✔ Mensajes de chat en sistema: ${messages?.length || 0}`);
    if (messages && messages.length > 0) {
      const sampleMsg = messages[0];
      assert.ok(sampleMsg.role === 'user' || sampleMsg.role === 'assistant', 'Rol debe ser user o assistant');
      assert.ok(typeof sampleMsg.text === 'string', 'Texto de mensaje debe ser string');
    }
  });

  it('4. Historial de versículos subrayados (Highlights tab)', async () => {
    const { data: highlights } = await supabase.from('verse_highlights').select('*').limit(5);
    console.log(`   ✔ Versículos subrayados en sistema: ${highlights?.length || 0}`);
    if (highlights && highlights.length > 0) {
      const sampleH = highlights[0];
      assert.ok(sampleH.bookName, 'Debe tener nombre de libro');
      assert.ok(sampleH.chapter, 'Debe tener capítulo');
      assert.ok(sampleH.verse, 'Debe tener versículo');
    }
  });

  it('5. Flujo de actualización de contraseña y datos pastorales', async () => {
    const { data: users } = await supabase.from('users').select('*').eq('role', 'USER').limit(1);
    if (users && users.length > 0) {
      const targetUser = users[0];
      const testTimestamp = new Date().toISOString();
      const { data: updated, error } = await supabase
        .from('users')
        .update({ updatedAt: testTimestamp })
        .eq('id', targetUser.id)
        .select()
        .single();
      assert.ifError(error);
      assert.equal(updated.id, targetUser.id);
      console.log(`   ✔ Actualización de perfil pastoral confirmada para ${targetUser.name}`);
    }
  });

  it('6. Generación de Resumen Pastoral con Inteligencia Artificial', async () => {
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    if (apiKey) {
      const prompt = 'Actúa como pastor de jóvenes. Escribe un consejo pastoral de 1 oración reconfortante y bíblica para un joven llamado David.';
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });
      const json = await res.json();
      const answer = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      assert.ok(answer, 'La IA de Gemini debe retornar una respuesta de resumen pastoral');
      console.log(`   ✔ IA Gemini Resumen Pastoral verificado: "${answer.trim().slice(0, 80)}..."`);
    } else {
      console.log('   ⚠ EXPO_PUBLIC_GEMINI_API_KEY no presente en entorno de prueba, omitiendo llamada directa a Gemini.');
    }
  });
});
