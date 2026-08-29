import type { VerseHighlight } from '../../../domain/entities/VerseHighlight';
import { apiRequest } from '../../api/apiClient';

export class ApiHighlightAdapter {
  listForChapter(versionId: string, bookId: number, chapter: number) {
    return apiRequest<VerseHighlight[]>(
      `/highlights?versionId=${versionId}&bookId=${bookId}&chapter=${chapter}`,
    );
  }

  listAll() {
    return apiRequest<VerseHighlight[]>('/highlights');
  }

  upsert(payload: {
    versionId: string;
    bookId: number;
    bookName: string;
    chapter: number;
    verse: number;
    verseText?: string;
    color: string;
  }) {
    return apiRequest<VerseHighlight>('/highlights', {
      method: 'POST',
      body: payload,
    });
  }

  remove(id: string) {
    return apiRequest(`/highlights/${id}`, { method: 'DELETE' });
  }

  removeByVerse(versionId: string, bookId: number, chapter: number, verse: number) {
    return apiRequest(
      `/highlights/verse/${versionId}/${bookId}/${chapter}/${verse}`,
      { method: 'DELETE' },
    );
  }
}
