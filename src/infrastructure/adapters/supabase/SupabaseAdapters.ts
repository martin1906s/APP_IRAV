import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStoredUser } from '../../api/authStore';
import { supabase } from '../../supabase/supabaseConfig';
import { ChatMessage } from '../../../domain/entities/ChatMessage';

function decodeBase64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = typeof atob === 'function' ? atob(base64) : Buffer.from(base64, 'base64').toString('binary');
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// Mock/Stub adapters para reemplazar el backend antiguo.
// Estas clases implementan la misma interfaz que esperaban los casos de uso,
// pero usan Supabase o devuelven datos locales temporalmente.

export class SupabaseProfileAdapter {
  async get() {
    const user = await getStoredUser();
    if (!user?.id) return null;
    const { data: profile, error } = await supabase.from('users').select('*').eq('id', user.id).single();
    if (error || !profile) return user as any;
    return profile;
  }
  async save(profile: any) {
    const user = await getStoredUser();
    const id = profile.id || user?.id;
    if (!id) return profile;
    const { error } = await supabase.from('users').update({
       name: profile.name,
       birthDate: profile.birthDate,
       phone: profile.phone,
       country: profile.country,
       preferredVersionId: profile.preferredVersionId,
       notificationsEnabled: profile.notificationsEnabled,
       voiceEnabled: profile.voiceEnabled,
       reminderHour: profile.reminderHour,
       reminderMinute: profile.reminderMinute,
       expoPushToken: profile.expoPushToken,
    }).eq('id', id);
    if (error) console.error('Error saving profile:', error);
    return profile;
  }
}

export class SupabaseMoodAdapter {
  async saveToday(mood: any, userId?: string) {
    let uid = userId;
    if (!uid) {
      const user = await getStoredUser();
      uid = user?.id;
    }
    if (!uid) {
      const { data } = await supabase.auth.getUser();
      uid = data.user?.id || 'a9e97eba-3c8b-4f78-80b1-4f2f1b87f20a';
    }

    const row = {
      id: Crypto.randomUUID(),
      userId: uid,
      mood: mood,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('mood_logs').insert([row]).select().single();
    if (error) {
       console.error('Error guardando mood_log en Supabase:', error);
       return { id: row.id, mood, date: row.date, createdAt: row.createdAt };
    }
    return data;
  }

  async getToday(): Promise<any> {
    const user = await getStoredUser();
    if (!user?.id) return null;
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('mood_logs')
      .select('*')
      .eq('userId', user.id)
      .eq('date', today)
      .order('createdAt', { ascending: false })
      .limit(1)
      .maybeSingle();
    return data || null;
  }

  async listRecent(limit = 14): Promise<any[]> {
    const user = await getStoredUser();
    if (!user?.id) return [];
    const { data } = await supabase
      .from('mood_logs')
      .select('*')
      .eq('userId', user.id)
      .order('createdAt', { ascending: false })
      .limit(limit);
    return data || [];
  }

  async saveInspiration(inspiration: any) {
    try {
      await AsyncStorage.setItem('@irav_cached_inspiration', JSON.stringify(inspiration));
    } catch {}
  }

  async getInspiration(date?: string) {
    try {
      const raw = await AsyncStorage.getItem('@irav_cached_inspiration');
      if (raw) return JSON.parse(raw);
    } catch {}
    return null;
  }
}

export class SupabaseChatAdapter {
  async listMessages() {
    const user = await getStoredUser();
    const uid = user?.id || (await supabase.auth.getUser()).data.user?.id;
    if (!uid) return [];
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('userId', uid)
      .order('createdAt', { ascending: true });
    if (error) {
      console.warn('Error fetching chat messages:', error);
      return [];
    }
    return (data || []).map((m: any) => ({
      id: m.id,
      role: m.role,
      text: m.text,
      createdAt: m.createdAt ? new Date(m.createdAt).getTime() : Date.now(),
    }));
  }

  async saveMessage(msg: any, userId?: string) {
    let uid = userId;
    if (!uid) {
      const user = await getStoredUser();
      uid = user?.id;
    }
    if (!uid) {
      const { data } = await supabase.auth.getUser();
      uid = data.user?.id || 'a9e97eba-3c8b-4f78-80b1-4f2f1b87f20a';
    }

    // Validar UUID id o generar uno válido
    const validId = (msg.id && msg.id.length === 36 && msg.id.includes('-'))
      ? msg.id
      : Crypto.randomUUID();

    const row = { 
       id: validId,
       userId: uid, 
       role: msg.role, 
       text: msg.text, 
       createdAt: new Date().toISOString()
    };
    const { data, error } = await supabase.from('chat_messages').insert([row]).select().single();
    if (error) {
       console.error('Error insertando mensaje en Supabase chat_messages:', error);
       return msg;
    }
    return { ...msg, ...data };
  }
}


export class SupabaseAdminAdapter {
  async listUsers() {
    const { data: users, error } = await supabase.from('users').select('*').order('name');
    if (error || !users) {
      console.error('Error fetching users:', error);
      return [];
    }

    const rows = await Promise.all(
      users.map(async (u: any) => {
        const { data: lastMood } = await supabase
          .from('mood_logs')
          .select('date, mood')
          .eq('userId', u.id)
          .order('createdAt', { ascending: false })
          .limit(1)
          .maybeSingle();

        return {
          ...u,
          lastMood: lastMood || null,
        };
      }),
    );

    return rows;
  }

  async getUser(id: string) {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
    if (error) return null;

    const { data: lastMood } = await supabase
      .from('mood_logs')
      .select('date, mood')
      .eq('userId', id)
      .order('createdAt', { ascending: false })
      .limit(1)
      .maybeSingle();

    return {
      ...data,
      lastMood: lastMood || null,
    };
  }

  async updateUser(id: string, data: any) {
    const payload = { ...data, updatedAt: new Date().toISOString() };
    const { error } = await supabase.from('users').update(payload).eq('id', id);
    if (error) console.error('Error updating user:', error);
    return this.getUser(id);
  }

  async createUser(data: any) {
    const newUser = {
      id: data.id || Crypto.randomUUID(),
      documentType: data.documentType,
      documentId: data.documentId,
      password: data.password,
      name: data.name,
      birthDate: data.birthDate,
      phone: data.phone,
      country: data.country,
      role: data.role || 'USER',
      preferredVersionId: data.preferredVersionId || 'NVI',
      notificationsEnabled: true,
      voiceEnabled: true,
      reminderHour: 8,
      reminderMinute: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const { data: inserted, error } = await supabase.from('users').insert([newUser]).select().single();
    if (error) console.error('Error creating user:', error);
    return inserted || newUser;
  }

  async deleteUser(id: string) {
    await Promise.all([
      supabase.from('mood_logs').delete().eq('userId', id),
      supabase.from('chat_messages').delete().eq('userId', id),
      supabase.from('verse_highlights').delete().eq('userId', id),
    ]);
    const { error } = await supabase.from('users').delete().eq('id', id);
    return !error;
  }

  async getUserMoods(id: string) {
    const { data, error } = await supabase
      .from('mood_logs')
      .select('*')
      .eq('userId', id)
      .order('createdAt', { ascending: false });
    if (error) console.error('Error fetching user moods:', error);
    return data || [];
  }

  async deleteMood(userId: string, moodId: string) {
    await supabase.from('mood_logs').delete().eq('id', moodId);
    return { deleted: true };
  }

  async getUserChat(id: string) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('userId', id)
      .order('createdAt', { ascending: false });
    if (error) console.error('Error fetching user chat:', error);
    return (data || []).map((m: any) => ({
      id: m.id,
      role: m.role,
      text: m.text,
      createdAt: new Date(m.createdAt).getTime(),
    }));
  }

  async deleteChatMessage(userId: string, messageId: string) {
    await supabase.from('chat_messages').delete().eq('id', messageId);
    return { deleted: true };
  }

  async getUserHighlights(id: string) {
    const { data, error } = await supabase
      .from('verse_highlights')
      .select('*')
      .eq('userId', id)
      .order('createdAt', { ascending: false });
    if (error) console.error('Error fetching user highlights:', error);
    return data || [];
  }

  async deleteHighlight(highlightId: string) {
    await supabase.from('verse_highlights').delete().eq('id', highlightId);
    return { deleted: true };
  }

  async generateSummary(id: string) {
    try {
      const [u, moods, chats, highlights] = await Promise.all([
        this.getUser(id),
        this.getUserMoods(id),
        this.getUserChat(id),
        this.getUserHighlights(id),
      ]);

      const userName = u?.name || 'este joven';

      // Recopilación detallada de estados de ánimo
      const moodLines = moods.slice(0, 10).map((m: any) => `- ${m.date}: ${m.mood}`).join('\n') || 'No ha registrado ánimos recientes.';

      // Recopilación detallada de conversaciones en el chat con Jesús
      // Invertir chats si vienen ordenados descendente para mostrarlos en orden cronológico a la IA
      const sortedChats = [...chats].reverse().slice(-12);
      const chatLines = sortedChats.map((c: any) => `${c.role === 'user' ? `${userName}` : 'Jesús'}: "${c.text}"`).join('\n') || 'No hay mensajes registrados en el chat.';

      // Recopilación de versículos leídos / subrayados
      const highlightLines = highlights.slice(0, 5).map((h: any) => `- ${h.bookName} ${h.chapter}:${h.verse}: "${h.verseText || 'versículo'}"`).join('\n') || 'Ninguno por ahora.';

      const prompt = `Eres el consejero pastoral principal de la comunidad juvenil IRAV.
Tu objetivo es analizar la información espiritual y emocional de ${userName} basada en sus registros reales y entregarle al pastor/líder un plan de acción pastoral directo, cálido y práctico sobre qué se debe hacer para pastorearlo y acompañarlo.

DATOS RECOPILADOS DEL JOVEN:
1. HISTORIAL DE ÁNIMOS RECIENTES:
${moodLines}

2. CONVERSACIONES E INQUIETUDES EN "HABLAR CON JESÚS":
${chatLines}

3. VERSÍCULOS BÍBLICOS SUBRAYADOS:
${highlightLines}

INSTRUCCIONES PARA TU RESPUESTA (Máximo 150 palabras, en tono pastoral claro y directo para el líder):
1. DIAGNÓSTICO DEL CORAZÓN: Resume brevemente cómo se siente el joven según sus ánimos y qué cargas, dudas o deseos expresó en su chat con Jesús.
2. ¿QUÉ SE DEBE HACER? (PLAN DE ACCIÓN PASTORAL):
- Una acción directa o tema de conversación que el pastor debe tocar con él esta semana (ej. cómo llamarlo, qué preguntarle con empatía).
- Un pasaje bíblico o promesa específica para compartirle según la necesidad puntual que expresó.`;

      const summaryText = await container.ai.chat(prompt);
      return { summary: summaryText };
    } catch {
      return { summary: 'El joven mantiene actividad en la app. Se recomienda tener una plática cercana con él para escuchar sus inquietudes y animarle en la oración.' };
    }
  }

  async getSettings() {
    const { data, error } = await supabase.from('system_settings').select('*').limit(1).maybeSingle();
    if (error || !data) {
      return {
        id: 1,
        chatRetentionDays: 30,
        defaultReminderHour: 8,
        defaultReminderMinute: 0,
        pastoralSummaryMaxWords: 100,
        dailyMoodRequired: true,
        defaultBibleVersion: 'NVI',
        notificationsEnabledByDefault: true,
        geminiModelOverride: null,
        updatedAt: new Date().toISOString(),
      };
    }
    return data;
  }

  async updateSettings(payload: any) {
    const existing = await this.getSettings();
    const updateData = {
      ...payload,
      updatedAt: new Date().toISOString(),
    };

    if (existing?.id) {
      const { data, error } = await supabase
        .from('system_settings')
        .update(updateData)
        .eq('id', existing.id)
        .select()
        .single();
      if (!error && data) return data;
    } else {
      const { data, error } = await supabase
        .from('system_settings')
        .insert([updateData])
        .select()
        .single();
      if (!error && data) return data;
    }
    return { ...existing, ...updateData };
  }

  async listAnnouncements() {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Error fetching announcements:', error);
      return [];
    }

    return (data || []).map((a: any) => ({
      ...a,
      imageUrl: a.imagePath || a.image_url || a.imageUrl,
      createdAt: a.createdAt || a.created_at,
    }));
  }

  async getAnnouncement(id: string) {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return {
      ...data,
      imageUrl: data.imagePath || data.image_url || data.imageUrl,
      createdAt: data.createdAt || data.created_at,
    };
  }

  private async uploadAnnouncementImage(base64: string, mimeType: string): Promise<string> {
    const fileName = `${Crypto.randomUUID()}.jpg`;
    try {
      const binary = decodeBase64ToArrayBuffer(base64);
      const { error } = await supabase.storage
        .from('announcements')
        .upload(fileName, binary, {
          contentType: mimeType || 'image/jpeg',
          upsert: true,
        });

      if (!error) {
        const { data: pub } = supabase.storage
          .from('announcements')
          .getPublicUrl(fileName);
        if (pub?.publicUrl) return pub.publicUrl;
      }
    } catch {
      // Si la subida a Storage es restringida por RLS en Supabase, usamos data URI seguro
    }
    return `data:${mimeType || 'image/jpeg'};base64,${base64}`;
  }

  async createAnnouncement(payload: any) {
    const session = await getStoredUser();
    const adminId = session?.id || 'c9ac7861-c97a-49e8-a2ab-1d9955947dfe';
    const id = Crypto.randomUUID();

    let imagePath: string | null = null;
    if (payload.imageBase64 && payload.imageMimeType) {
      imagePath = await this.uploadAnnouncementImage(payload.imageBase64, payload.imageMimeType);
    }

    const row = {
      id,
      title: payload.title,
      body: payload.body,
      imagePath,
      createdById: adminId,
      status: payload.sendNow ? 'PUBLISHED' : 'DRAFT',
      sentAt: payload.sendNow ? new Date().toISOString() : null,
      recipientsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('announcements').insert([row]).select().single();
    if (error) {
      console.error('Error creating announcement in Supabase:', error);
      throw error;
    }

    if (payload.sendNow) {
      return this.sendAnnouncement(id);
    }

    return {
      ...data,
      imageUrl: data.imagePath,
    };
  }

  async updateAnnouncement(id: string, payload: any) {
    const updateRow: any = {
      updatedAt: new Date().toISOString(),
    };
    if (payload.title) updateRow.title = payload.title;
    if (payload.body) updateRow.body = payload.body;
    if (payload.removeImage) {
      updateRow.imagePath = null;
    } else if (payload.imageBase64 && payload.imageMimeType) {
      updateRow.imagePath = await this.uploadAnnouncementImage(payload.imageBase64, payload.imageMimeType);
    }

    const { data, error } = await supabase
      .from('announcements')
      .update(updateRow)
      .eq('id', id)
      .select()
      .single();

    if (error) console.error('Error updating announcement:', error);
    return data || payload;
  }

  async deleteAnnouncement(id: string) {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    return { deleted: !error };
  }

  async sendAnnouncement(id: string) {
    const announcement = await this.getAnnouncement(id);
    if (!announcement) throw new Error('Anuncio no encontrado');

    // Obtener todos los tokens registrados en la base de datos
    const { data: usersWithTokens } = await supabase
      .from('users')
      .select('id, name, expoPushToken')
      .not('expoPushToken', 'is', null);

    const validTokens = (usersWithTokens || [])
      .map((u: any) => u.expoPushToken)
      .filter((t: string) => t && t.startsWith('ExponentPushToken'));

    let recipientsCount = 0;

    if (validTokens.length > 0) {
      const messages = validTokens.map((token: string) => ({
        to: token,
        sound: 'default',
        title: `📢 ${announcement.title}`,
        body: announcement.body,
        data: { announcementId: id, type: 'announcement' },
      }));

      try {
        const pushRes = await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Accept-Encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messages),
        });

        if (pushRes.ok) {
          recipientsCount = validTokens.length;
        }
      } catch (err) {
        console.warn('Error enviando push notifications via Expo:', err);
      }
    }

    // Actualizar estado del anuncio en Supabase
    await supabase
      .from('announcements')
      .update({
        status: 'PUBLISHED',
        sentAt: new Date().toISOString(),
        recipientsCount,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id);

    return {
      recipientsCount,
      targetedUsers: usersWithTokens?.length || 0,
      targetedDevices: validTokens.length,
      announcement,
    };
  }

  async getStats() {
    const [usersRes, moodsRes, chatsRes, highlightsRes] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('mood_logs').select('*', { count: 'exact', head: true }),
      supabase.from('chat_messages').select('*', { count: 'exact', head: true }),
      supabase.from('verse_highlights').select('*', { count: 'exact', head: true }),
    ]);

    return {
      users: usersRes.count || 0,
      moods: moodsRes.count || 0,
      chats: chatsRes.count || 0,
      highlights: highlightsRes.count || 0,
    };
  }

  async getAnalytics() {
    const [{ data: moodLogs }, { data: chats }, { data: users }] = await Promise.all([
      supabase.from('mood_logs').select('*'),
      supabase.from('chat_messages').select('*'),
      supabase.from('users').select('*'),
    ]);

    // Procesar moodsByType
    const moodMap: Record<string, number> = {};
    if (moodLogs) {
      moodLogs.forEach((m: any) => {
        const mood = m.mood || 'Desconocido';
        moodMap[mood] = (moodMap[mood] || 0) + 1;
      });
    }
    const moodsByType = Object.keys(moodMap).map((mood) => ({ mood, count: moodMap[mood] }));

    // Procesar activityLast7Days
    const today = new Date();
    const activityMap: Record<string, { moods: number; chats: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const isoDate = d.toISOString().split('T')[0];
      activityMap[isoDate] = { moods: 0, chats: 0 };
    }

    if (moodLogs) {
      moodLogs.forEach((m: any) => {
        const dateStr = m.date || m.createdAt || m.created_at;
        if (dateStr && activityMap[dateStr.split('T')[0]]) {
          activityMap[dateStr.split('T')[0]].moods++;
        }
      });
    }
    if (chats) {
      chats.forEach((c: any) => {
        const dateStr = c.createdAt || c.created_at;
        if (dateStr && activityMap[dateStr.split('T')[0]]) {
          activityMap[dateStr.split('T')[0]].chats++;
        }
      });
    }

    const activityLast7Days = Object.keys(activityMap)
      .sort()
      .map((date) => ({
        date,
        moods: activityMap[date].moods,
        chats: activityMap[date].chats,
      }));

    // Procesar newUsersByMonth
    const monthMap: Record<string, number> = {};
    if (users) {
      users.forEach((u: any) => {
        const dateStr = u.createdAt || u.created_at;
        if (dateStr) {
          const date = new Date(dateStr);
          const monthName = date.toLocaleString('es', { month: 'short' });
          const key = monthName.charAt(0).toUpperCase() + monthName.slice(1);
          monthMap[key] = (monthMap[key] || 0) + 1;
        }
      });
    }

    const newUsersByMonth = Object.keys(monthMap).map((month) => ({
      month,
      count: monthMap[month],
    }));

    if (newUsersByMonth.length === 0) {
      const m = today.toLocaleString('es', { month: 'short' });
      newUsersByMonth.push({ month: m.charAt(0).toUpperCase() + m.slice(1), count: 0 });
    }

    return {
      moodsByType: moodsByType.length ? moodsByType : [{ mood: 'Sin datos', count: 0 }],
      activityLast7Days,
      newUsersByMonth,
    };
  }
}

export class SupabaseConfigAdapter {
  async get() {
    const { data } = await supabase.from('system_settings').select('*').limit(1).maybeSingle();
    return data || { dailyMoodRequired: true };
  }
}

export class SupabaseAnnouncementsAdapter {
  async list() {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Error fetching announcements:', error);
      return [];
    }

    return (data || []).map((item: any) => {
      let imageUrl = item.imagePath || item.image_url || item.imageUrl;
      return {
        ...item,
        imageUrl,
        createdAt: item.createdAt || item.created_at,
      };
    });
  }

  async get(id: string) {
    const { data } = await supabase.from('announcements').select('*').eq('id', id).single();
    if (!data) return null;

    let imageUrl = data.imagePath || data.image_url || data.imageUrl;
    return {
      ...data,
      imageUrl,
      createdAt: data.createdAt || data.created_at,
    };
  }
}
export class SupabaseHighlightAdapter {
  async saveHighlight(h: any, userId?: string) {
    let uid = userId;
    if (!uid) {
      const user = await getStoredUser();
      uid = user?.id;
    }
    if (!uid) {
      const { data } = await supabase.auth.getUser();
      uid = data.user?.id || 'a9e97eba-3c8b-4f78-80b1-4f2f1b87f20a';
    }

    const validId = Crypto.randomUUID();
    const row = {
      id: validId,
      userId: uid,
      versionId: h.versionId || 'NVI',
      bookId: h.bookId,
      bookName: h.bookName,
      chapter: h.chapter,
      verse: h.verse,
      verseText: h.verseText,
      color: h.color || '#FFD700',
      createdAt: new Date().toISOString(),
    };

    // Borrar si existía un subrayado previo en el mismo versículo
    await supabase.from('verse_highlights').delete().match({ userId: uid, bookId: h.bookId, chapter: h.chapter, verse: h.verse });
    const { data, error } = await supabase.from('verse_highlights').insert([row]).select().single();
    if (error) {
      console.error('Error insertando highlight en Supabase:', error);
      return h;
    }
    return data;
  }

  async deleteHighlight(h: any, userId?: string) {
    let uid = userId;
    if (!uid) {
      const user = await getStoredUser();
      uid = user?.id;
    }
    if (!uid) {
      const { data } = await supabase.auth.getUser();
      uid = data.user?.id || 'a9e97eba-3c8b-4f78-80b1-4f2f1b87f20a';
    }

    if (h.id) {
      await supabase.from('verse_highlights').delete().eq('id', h.id);
    } else {
      await supabase.from('verse_highlights').delete().match({ userId: uid, bookId: h.bookId, chapter: h.chapter, verse: h.verse });
    }
  }

  async listHighlights(bookId?: number, chapter?: number) {
    const user = await getStoredUser();
    const uid = user?.id || (await supabase.auth.getUser()).data.user?.id;
    if (!uid) return [];
    let query = supabase.from('verse_highlights').select('*').eq('userId', uid);
    if (bookId !== undefined) query = query.eq('bookId', bookId);
    if (chapter !== undefined) query = query.eq('chapter', chapter);
    const { data, error } = await query;
    if (error) {
      console.warn('Error fetching highlights:', error);
      return [];
    }
    return data || [];
  }
}
import type { ChallengeStatus, ChallengeItem, ChallengeCategory, ChallengeDayState } from '../../../domain/entities/Challenge';

const MOCK_CATALOG: ChallengeItem[] = [
  { day: 1, title: 'Oración de entrega', description: 'Dedica 5 minutos en la mañana a entregar tus planes del mes a Dios.', category: 'oración' },
  { day: 2, title: 'Alabanza con el corazón', description: 'Escucha una canción de adoración reflexiva y canta con sinceridad.', category: 'alabanza' },
  { day: 3, title: 'Lectura de Salmos', description: 'Lee con calma el Salmo 23 y subraya lo que Dios te habla hoy.', category: 'lectura' },
  { day: 4, title: 'Acción de servicio', description: 'Ayuda a alguien de tu familia o amigo con un favor desinteresado.', category: 'servicio' },
  { day: 5, title: 'Cinco gratitudes', description: 'Escribe 5 motivos concretos por los cuales estás agradecido a Dios.', category: 'gratitud' },
  { day: 6, title: 'Silencio y escucha', description: 'Quédate en quietud 5 minutos sin distracciones, escuchando la voz de Dios.', category: 'silencio' },
  { day: 7, title: 'Oración por un amigo', description: 'Intercede por alguien cercano que esté pasando por un momento difícil.', category: 'oración' },
  { day: 8, title: 'Lectura de Proverbios', description: 'Lee Proverbios 3:5-6 y reflexiona en cómo confiar más en el Señor.', category: 'lectura' },
  { day: 9, title: 'Palabra de aliento', description: 'Envía un mensaje edificante a un hermano de la iglesia o amigo.', category: 'servicio' },
  { day: 10, title: 'Alabanza al aire libre', description: 'Observa la creación de Dios durante el día y dale gloria.', category: 'alabanza' },
  { day: 11, title: 'Perdón sincero', description: 'Pídele a Dios paz para perdonar a quien te haya ofendido.', category: 'oración' },
  { day: 12, title: 'Lectura de los Evangelios', description: 'Lee Mateo 6:25-34 y descansa en la provisión del Padre.', category: 'lectura' },
  { day: 13, title: 'Gratitud en la dificultad', description: 'Agradece a Dios por los aprendizajes que te dejan los retos.', category: 'gratitud' },
  { day: 14, title: 'Ayuda en el hogar', description: 'Haz una tarea en casa sin que nadie te lo pida con alegría.', category: 'servicio' },
  { day: 15, title: 'Silencio nocturno', description: 'Antes de dormir, apaga pantallas 10 minutos y ora agradeciendo el día.', category: 'silencio' },
  { day: 16, title: 'Lectura de Romanos', description: 'Medita en Romanos 8:38-39 y afírmate en el amor incondicional de Dios.', category: 'lectura' },
  { day: 17, title: 'Oración por tu ciudad', description: 'Ora por las autoridades, iglesias y paz en tu comunidad.', category: 'oración' },
  { day: 18, title: 'Alabanza en gratitud', description: 'Canta una alabanza de victoria recordando lo que Dios ya ha hecho.', category: 'alabanza' },
  { day: 19, title: 'Servicio en IRAV', description: 'Saluda y anima a los líderes y jóvenes en la congregación.', category: 'servicio' },
  { day: 20, title: 'Memorización bíblica', description: 'Memoriza Filipenses 4:13 y repítelo en tus momentos de reto.', category: 'lectura' },
  { day: 21, title: 'Gratitud por tu llamado', description: 'Agradece a Dios por tus dones y talentos únicos.', category: 'gratitud' },
  { day: 22, title: 'Oración por los no creyentes', description: 'Ora por alguien que aún no conoce a Jesús.', category: 'oración' },
  { day: 23, title: 'Silencio en oración', description: 'Pasa tiempo a solas con Jesús simplemente disfrutando su presencia.', category: 'silencio' },
  { day: 24, title: 'Lectura de Filipenses', description: 'Lee Filipenses 4:6-7 y entrega toda ansiedad en oración.', category: 'lectura' },
  { day: 25, title: 'Generosidad', description: 'Comparte algo de tu tiempo, comida o un detalle con alguien.', category: 'servicio' },
  { day: 26, title: 'Alabanza de corazón', description: 'Dedica tu canción favorita a Dios meditando en su letra.', category: 'alabanza' },
  { day: 27, title: 'Lectura y meditación', description: 'Lee Josué 1:9 y recuérdate a ti mismo ser fuerte y valiente.', category: 'lectura' },
  { day: 28, title: 'Oración de gratitud familiar', description: 'Bendice a tus padres, hermanos o familia en oración.', category: 'oración' },
  { day: 29, title: 'Consagración personal', description: 'Renueva tu compromiso de caminar en integridad y amor con Dios.', category: 'oración' },
  { day: 30, title: 'Celebración y victoria', description: '¡Completaste el reto! Celebra la fidelidad de Dios en este mes.', category: 'alabanza' },
];

const CHALLENGE_STORAGE_KEY_PREFIX = '@irav_challenge_completed_days_';

export class SupabaseChallengeAdapter {
  private async getStorageKey(yearMonth: string): Promise<string> {
    try {
      const user = await getStoredUser();
      const userId = user?.id || 'guest';
      return `${CHALLENGE_STORAGE_KEY_PREFIX}${userId}_${yearMonth}`;
    } catch {
      return `${CHALLENGE_STORAGE_KEY_PREFIX}guest_${yearMonth}`;
    }
  }

  private async getCompletedDaysFromStorage(yearMonth: string): Promise<number[]> {
    try {
      const key = await this.getStorageKey(yearMonth);
      const raw = await AsyncStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Error reading completed challenge days from storage:', e);
    }
    return [];
  }

  private async saveCompletedDaysToStorage(yearMonth: string, days: number[]): Promise<void> {
    try {
      const key = await this.getStorageKey(yearMonth);
      await AsyncStorage.setItem(key, JSON.stringify(days));
    } catch (e) {
      console.warn('Error saving completed challenge days to storage:', e);
    }
  }

  async getStatus(): Promise<ChallengeStatus> {
    const now = new Date();
    const dayOfMonth = Math.min(Math.max(now.getDate(), 1), 30);
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const monthLabel = monthNames[now.getMonth()];
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const completedDays = await this.getCompletedDaysFromStorage(yearMonth);
    const isTodayDone = completedDays.includes(dayOfMonth);

    const states: Record<number, ChallengeDayState> = {};
    const missedDays: number[] = [];

    for (let d = 1; d <= 30; d++) {
      if (completedDays.includes(d)) {
        states[d] = 'completed';
      } else if (d < dayOfMonth) {
        states[d] = 'missed';
        missedDays.push(d);
      } else if (d === dayOfMonth) {
        states[d] = isTodayDone ? 'completed' : 'today';
      } else {
        states[d] = 'locked';
      }
    }

    const todayIdx = Math.min(dayOfMonth - 1, MOCK_CATALOG.length - 1);
    const todayChallenge = MOCK_CATALOG[todayIdx];

    return {
      enrolled: true,
      yearMonth,
      monthLabel,
      currentDay: dayOfMonth,
      calendarDay: dayOfMonth,
      totalDays: 30,
      completedDays: [...completedDays],
      missedDays,
      dayStates: states,
      todayCompleted: isTodayDone,
      finished: false,
      hasChallengeToday: true,
      todayChallenge,
      catalog: MOCK_CATALOG,
    };
  }

  async completeToday(): Promise<ChallengeStatus> {
    const now = new Date();
    const dayOfMonth = Math.min(Math.max(now.getDate(), 1), 30);
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const completedDays = await this.getCompletedDaysFromStorage(yearMonth);
    if (!completedDays.includes(dayOfMonth)) {
      completedDays.push(dayOfMonth);
      await this.saveCompletedDaysToStorage(yearMonth, completedDays);
    }
    return this.getStatus();
  }

  async getWeeklyReflection(): Promise<string> {
    const status = await this.getStatus();
    const completedCount = status.completedDays.length;
    const missedCount = status.missedDays.length;
    const todayDay = status.calendarDay;

    const prompt = `Actúa como pastor juvenil y mentor espiritual cálido de la comunidad IRAV.
El joven está en el día ${todayDay} del reto mensual.
- Días completados: ${completedCount}
- Días pendientes o no realizados: ${missedCount}
- Últimos retos realizados: oración, lectura de Salmos y gratitud.

Genera una breve reflexión semanal empática, motivadora y basada en la gracia de Dios (máximo 90 palabras). Resalta la constancia si ha cumplido, o anímale con amor sin juzgar si ha tenido días difíciles. Termina con un versículo breve de aliento.`;

    try {
      const text = await container.ai.chat(prompt);
      return text;
    } catch {
      return `¡Qué bendición tu perseverancia en este reto! Has completado ${completedCount} días de fe. Recuerda que Dios no busca perfección, sino un corazón dispuesto que busque su rostro día a día. "Todo lo puedo en Cristo que me fortalece" (Filipenses 4:13). ¡Sigue adelante con gozo!`;
    }
  }
}
