import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, FlatList } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { BibleReaderHeader } from '../components/bible/BibleReaderHeader';
import { colors, spacing, typography, radius } from '../theme';
import { container } from '../../composition/container';
import type { Chapter, Verse } from '../../domain/entities/Verse';
import { Ionicons } from '@expo/vector-icons';
import { getStoredUser } from '../../infrastructure/api/authStore';

export function ChapterScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const { versionId, versionName, bookId, bookName, chapters } = route.params;
  const initialChapter = route.params.chapter || 1;

  const [currentChapter, setCurrentChapter] = useState(initialChapter);
  const [isNightMode, setIsNightMode] = useState(false);
  const [fontSizeOffset, setFontSizeOffset] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  const [data, setData] = useState<Chapter | null>(null);
  const [highlights, setHighlights] = useState<Record<number, string>>({});
  const [userHighlightColor, setUserHighlightColor] = useState('#FFD700');
  const [loading, setLoading] = useState(true);
  
  // Estado para el modal selector de capítulos
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  // Tema dinámico
  const bgColor = isNightMode ? colors.bgDark : colors.bg;
  const textColor = isNightMode ? colors.textLight : colors.text;

  useEffect(() => {
    void getStoredUser().then((u) => {
      if (u?.highlightColor) setUserHighlightColor(u.highlightColor);
    });
  }, []);

  const loadData = async (chapterNum: number) => {
    setLoading(true);
    try {
      const [chap, dbHighlights] = await Promise.all([
        container.getChapter.execute(versionId, bookId, chapterNum),
        container.highlights.listHighlights(bookId, chapterNum)
      ]);
      setData(chap);
      
      const hlMap: Record<number, string> = {};
      if (dbHighlights) {
        dbHighlights.forEach((h: any) => {
          hlMap[h.verse] = h.color || '#FFD700';
        });
      }
      setHighlights(hlMap);
    } catch (e) {
      console.error('Error cargando capítulo:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(currentChapter);
  }, [versionId, bookId, currentChapter]);

  const toggleHighlight = async (verse: Verse) => {
    const isHighlighted = !!highlights[verse.number];
    
    // Optimistic UI update
    setHighlights(prev => {
      const next = { ...prev };
      if (isHighlighted) {
        delete next[verse.number];
      } else {
        next[verse.number] = userHighlightColor;
      }
      return next;
    });

    try {
      const payload = {
        versionId: versionId || 'NVI',
        bookId,
        bookName,
        chapter: currentChapter,
        verse: verse.number,
        verseText: verse.text,
        color: userHighlightColor,
      };

      if (isHighlighted) {
        await container.highlights.deleteHighlight(payload);
      } else {
        await container.highlights.saveHighlight(payload);
      }
    } catch (e) {
      // Revert if failed
      console.error("Error saving highlight", e);
      setHighlights(prev => {
        const next = { ...prev };
        if (isHighlighted) next[verse.number] = userHighlightColor;
        else delete next[verse.number];
        return next;
      });
    }
  };

  const goPrev = () => {
    if (currentChapter > 1) {
      setCurrentChapter(currentChapter - 1);
    } else if (bookId > 1) {
      nav.goBack();
    }
  };

  const goNext = () => {
    if (currentChapter < chapters) {
      setCurrentChapter(currentChapter + 1);
    } else if (bookId < 66) {
      nav.goBack();
    }
  };
  
  // Generamos un array [1, 2, 3, ..., chapters]
  const chaptersArray = Array.from({ length: chapters }, (_, i) => i + 1);

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <BibleReaderHeader 
        isNightMode={isNightMode}
        onToggleNightMode={() => setIsNightMode(!isNightMode)}
        onIncreaseFont={() => setFontSizeOffset(prev => Math.min(prev + 4, 12))}
        onDecreaseFont={() => setFontSizeOffset(prev => Math.max(prev - 2, -4))}
        isBookmarked={isBookmarked}
        onToggleBookmark={() => setIsBookmarked(!isBookmarked)}
        currentChapter={currentChapter}
        onOpenChapterSelector={() => setIsSelectorOpen(true)}
        onBack={() => nav.goBack()}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} size="large" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.bookTitle, { color: textColor }]}>
            {bookName} {currentChapter}
          </Text>
          <Text style={styles.subtitle}>{versionName}</Text>

          {data?.verses.map((v) => {
            const hColor = highlights[v.number];
            return (
              <Text 
                key={v.number} 
                style={[
                  styles.verse, 
                  { 
                    color: textColor, 
                    fontSize: typography.verse.fontSize + fontSizeOffset,
                    backgroundColor: hColor ? hColor + '40' : 'transparent', // 40 = 25% opacity
                    borderRadius: 4
                  }
                ]}
                onPress={() => toggleHighlight(v)}
              >
                <Text style={styles.verseNumber}>{v.number} </Text>
                {v.text}
              </Text>
            );
          })}

          <View style={styles.navButtons}>
            <TouchableOpacity onPress={goPrev} style={styles.navBtn}>
              <Ionicons name="chevron-back" size={24} color={textColor} />
              <Text style={[styles.navBtnText, { color: textColor }]}>Anterior</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={goNext} style={styles.navBtn}>
              <Text style={[styles.navBtnText, { color: textColor }]}>Siguiente</Text>
              <Ionicons name="chevron-forward" size={24} color={textColor} />
            </TouchableOpacity>
          </View>
          
          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* Modal para elegir capítulo */}
      <Modal
        visible={isSelectorOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsSelectorOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: bgColor }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textColor }]}>{bookName}</Text>
              <TouchableOpacity onPress={() => setIsSelectorOpen(false)}>
                <Ionicons name="close" size={28} color={textColor} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={chaptersArray}
              keyExtractor={(item) => item.toString()}
              numColumns={5}
              contentContainerStyle={{ padding: spacing.md }}
              columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: spacing.md }}
              renderItem={({ item }) => {
                const isActive = item === currentChapter;
                return (
                  <TouchableOpacity
                    style={[
                      styles.chapterBox,
                      isActive && styles.chapterBoxActive
                    ]}
                    onPress={() => {
                      setCurrentChapter(item);
                      setIsSelectorOpen(false);
                    }}
                  >
                    <Text style={[
                      styles.chapterBoxText, 
                      { color: isActive ? colors.textLight : textColor }
                    ]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: spacing.lg,
  },
  bookTitle: {
    fontFamily: typography.hero.fontFamily,
    fontSize: typography.hero.fontSize,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: typography.subtitle.fontFamily,
    color: colors.textMuted,
    marginBottom: spacing.xl,
  },
  verse: {
    fontFamily: typography.verse.fontFamily,
    lineHeight: typography.verse.lineHeight,
    marginBottom: spacing.md,
  },
  verseNumber: {
    fontFamily: typography.sansBold,
    fontSize: 12,
    color: colors.goldDark,
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xxl,
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingTop: spacing.lg,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
  },
  navBtnText: {
    fontFamily: typography.sansMedium,
    fontSize: 16,
  },
  // Estilos del Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '60%',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    fontFamily: typography.title.fontFamily,
    fontSize: 22,
  },
  chapterBox: {
    width: 50,
    height: 50,
    borderRadius: radius.md,
    backgroundColor: colors.border, // usa color neutro de borde
    justifyContent: 'center',
    alignItems: 'center',
  },
  chapterBoxActive: {
    backgroundColor: colors.accent,
  },
  chapterBoxText: {
    fontFamily: typography.sansBold,
    fontSize: 16,
  },
});
