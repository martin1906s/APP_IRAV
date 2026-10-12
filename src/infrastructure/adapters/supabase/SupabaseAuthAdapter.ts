import { supabase } from '../../supabase/supabaseConfig';
import type { UserProfile, DocumentType, Role } from '../../../domain/entities/UserProfile';
import { saveSession, clearSession } from '../../api/authStore';
import { seedSessionCache } from '../../api/sessionCache';
import * as Crypto from 'expo-crypto';

export class SupabaseAuthAdapter {
  async login(documentType: DocumentType, documentId: string, password: string) {
    // El usuario indicó que el password en la base de datos es literalmente el UUID
    // Consultamos directamente la tabla "users" en el esquema public
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('documentType', documentType)
      .eq('documentId', documentId.trim())
      .eq('password', password.trim())
      .single();

    if (error || !data) {
      throw new Error('Credenciales incorrectas. Verifica tu documento y contraseña.');
    }

    const userProfile: UserProfile = {
      id: data.id,
      documentType: data.documentType as DocumentType,
      documentId: data.documentId,
      name: data.name || 'Usuario',
      role: (data.role as Role) || 'USER',
      phone: data.phone,
      country: data.country,
      birthDate: data.birthDate,
      voiceEnabled: data.voiceEnabled ?? true,
      preferredVersionId: data.preferredVersionId || 'RVR1960',
    };

    // Usaremos el ID del usuario como token falso ya que no estamos usando Supabase Auth real
    const fakeToken = `token_${data.id}`;
    
    await saveSession(fakeToken, userProfile);
    seedSessionCache(userProfile);

    return {
      accessToken: fakeToken,
      user: userProfile,
    };
  }

  async register(payload: {
    documentType: DocumentType;
    documentId: string;
    password: string;
    name: string;
    birthDate: string;
    phone: string;
    country: string;
    preferredVersionId?: string;
  }) {
    // Verificamos si ya existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('documentType', payload.documentType)
      .eq('documentId', payload.documentId)
      .maybeSingle();

    if (existingUser) {
      throw new Error('Este usuario ya está registrado.');
    }

    const newUser = {
      id: Crypto.randomUUID(),
      documentType: payload.documentType,
      documentId: payload.documentId,
      password: payload.password, // guardamos tal cual (o UUID)
      name: payload.name,
      birthDate: payload.birthDate,
      phone: payload.phone,
      country: payload.country,
      role: 'USER',
      preferredVersionId: payload.preferredVersionId || 'RVR1960',
      voiceEnabled: true,
    };

    const { error } = await supabase.from('users').insert(newUser);

    if (error) {
      throw new Error(`Error en el registro: ${error.message}`);
    }

    const userProfile: UserProfile = {
      id: newUser.id,
      documentType: newUser.documentType as DocumentType,
      documentId: newUser.documentId,
      name: newUser.name,
      role: 'USER',
      phone: newUser.phone,
      country: newUser.country,
      birthDate: newUser.birthDate,
      voiceEnabled: true,
      preferredVersionId: newUser.preferredVersionId,
    };

    const fakeToken = `token_${newUser.id}`;
    
    await saveSession(fakeToken, userProfile);
    seedSessionCache(userProfile);

    return {
      accessToken: fakeToken,
      user: userProfile,
    };
  }

  async me(): Promise<UserProfile | null> {
    // No usamos sesiones reales de Supabase Auth, dependemos de la caché local
    // App.tsx y authStore manejan el restablecimiento de sesión en la app
    const { getStoredUser } = require('../../api/authStore');
    return await getStoredUser();
  }

  async logout() {
    await clearSession();
  }
}
