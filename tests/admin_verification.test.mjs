import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://udvccrhuqeiqejhiuakk.supabase.co';
const supabaseKey = 'sb_publishable_p_XVFg2oNiXVg3NRYXgBhQ_T2_mbkvw';
const supabase = createClient(supabaseUrl, supabaseKey);

describe('Admin Panel & Real Data Verification Suite', () => {

  it('1. Estadísticas Reales de la Base de Datos (getStats)', async () => {
    const [uRes, mRes, cRes, hRes] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('mood_logs').select('*', { count: 'exact', head: true }),
      supabase.from('chat_messages').select('*', { count: 'exact', head: true }),
      supabase.from('verse_highlights').select('*', { count: 'exact', head: true }),
    ]);

    assert.ok(typeof uRes.count === 'number', 'users count debe ser numérico');
    assert.ok(uRes.count > 0, 'Debe haber usuarios registrados reales en la BD');
    assert.ok(typeof mRes.count === 'number', 'moods count debe ser numérico');
    assert.ok(typeof cRes.count === 'number', 'chats count debe ser numérico');
    assert.ok(typeof hRes.count === 'number', 'highlights count debe ser numérico');
    console.log(`   ✔ Datos reales confirmados: ${uRes.count} usuarios, ${mRes.count} registros de ánimo, ${cRes.count} chats, ${hRes.count} versículos.`);
  });

  it('2. Listado de Usuarios Real y Detalle con lastMood (listUsers & getUser)', async () => {
    const { data: users, error } = await supabase.from('users').select('*').order('name');
    assert.ifError(error);
    assert.ok(Array.isArray(users), 'users debe ser un arreglo');
    assert.ok(users.length > 0, 'El arreglo de usuarios no debe estar vacío');

    const admin = users.find(u => u.role === 'ADMIN');
    assert.ok(admin, 'Debe existir al menos un usuario administrador');
    assert.ok(admin.name, 'El administrador debe tener nombre');
    assert.ok(admin.documentId, 'El administrador debe tener documento de identidad');

    // Comprobar asociación de mood_logs
    const { data: lastMood } = await supabase
      .from('mood_logs')
      .select('date, mood')
      .eq('userId', admin.id)
      .order('createdAt', { ascending: false })
      .limit(1)
      .maybeSingle();

    console.log(`   ✔ Usuario verificado: ${admin.name} (Rol: ${admin.role}, Cédula: ${admin.documentId}, Último ánimo: ${lastMood?.mood || 'Ninguno'})`);
  });

  it('3. Gestión de Configuración Global del Sistema (system_settings)', async () => {
    const { data: settings, error } = await supabase.from('system_settings').select('*').limit(1).maybeSingle();
    assert.ifError(error);
    assert.ok(settings, 'Debe existir la fila de configuración en system_settings');
    assert.ok(typeof settings.chatRetentionDays === 'number', 'chatRetentionDays debe ser un número');
    assert.ok(typeof settings.defaultReminderHour === 'number', 'defaultReminderHour debe ser un número');
    assert.ok(typeof settings.dailyMoodRequired === 'boolean', 'dailyMoodRequired debe ser booleano');
    console.log(`   ✔ Configuración del sistema verificada: Retención: ${settings.chatRetentionDays}d, Recordatorio: ${settings.defaultReminderHour}h, Versión Bíblica: ${settings.defaultBibleVersion}`);
  });

  it('4. Módulo de Anuncios: Listar y Obtener Anuncio Real', async () => {
    const { data: announcements, error } = await supabase
      .from('announcements')
      .select('*')
      .order('createdAt', { ascending: false });

    assert.ifError(error);
    assert.ok(Array.isArray(announcements), 'Anuncios debe ser un arreglo');
    assert.ok(announcements.length > 0, 'Debe haber al menos un anuncio publicado en el historial');

    const sample = announcements[0];
    assert.ok(sample.title, 'El anuncio debe tener título');
    assert.ok(sample.body, 'El anuncio debe tener cuerpo de mensaje');
    assert.ok(sample.createdById, 'El anuncio debe tener un autor registrado');
    console.log(`   ✔ Anuncio verificado: "${sample.title}" - Estado: ${sample.status} - Imagen: ${sample.imagePath ? 'Sí' : 'No'}`);
  });

  it('5. Envío Real de Notificaciones Push vía Expo Push API', async () => {
    const { data: usersWithTokens } = await supabase
      .from('users')
      .select('id, name, expoPushToken')
      .not('expoPushToken', 'is', null);

    const validTokens = (usersWithTokens || [])
      .map(u => u.expoPushToken)
      .filter(t => t && t.startsWith('ExponentPushToken'));

    assert.ok(validTokens.length > 0, 'Debe haber al menos un token de Expo Push real registrado en la BD');

    const messages = validTokens.map(token => ({
      to: token,
      sound: 'default',
      title: '📢 Verificación IRAV Admin',
      body: 'Prueba de validación de entrega de notificaciones push',
      data: { test: true },
    }));

    const pushRes = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    assert.equal(pushRes.status, 200, 'Expo Push API debe responder con status 200');
    const pushJson = await pushRes.json();
    assert.ok(Array.isArray(pushJson.data), 'La respuesta de Expo debe incluir arreglo de tickets');
    assert.equal(pushJson.data[0].status, 'ok', 'El ticket de notificación debe ser "ok"');
    console.log(`   ✔ Notificación Push entregada exitosamente al token ${validTokens[0]} con ticket ID: ${pushJson.data[0].id}`);
  });
});
