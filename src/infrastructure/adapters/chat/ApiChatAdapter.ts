import type { ChatMessage } from '../../../domain/entities/ChatMessage';
import { apiRequest } from '../../api/apiClient';

export class ApiChatAdapter {
  async listMessages(): Promise<ChatMessage[]> {
    const rows = await apiRequest<
      Array<{
        id: string;
        role: 'user' | 'assistant';
        text: string;
        referenceJson?: ChatMessage['reference'];
        createdAt: string;
      }>
    >('/chat/messages');

    return rows.map((row) => ({
      id: row.id,
      role: row.role,
      text: row.text,
      reference: row.referenceJson,
      createdAt: new Date(row.createdAt).getTime(),
    }));
  }

  async saveMessage(message: ChatMessage): Promise<void> {
    await apiRequest('/chat/messages', {
      method: 'POST',
      body: {
        role: message.role,
        text: message.text,
        referenceJson: message.reference ?? null,
      },
    });
  }
}
