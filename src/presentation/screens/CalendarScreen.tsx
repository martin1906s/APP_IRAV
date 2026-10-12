import { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { WeekCalendarStrip } from '../components/calendar/WeekCalendarStrip';
import { EventCard } from '../components/calendar/EventCard';
import { colors } from '../theme';

const MOCK_DAYS = [
  { dayName: 'Mo', dayNumber: 16, dateStr: '2026-09-16' },
  { dayName: 'Lu', dayNumber: 17, dateStr: '2026-09-17' },
  { dayName: 'Mar', dayNumber: 18, dateStr: '2026-09-18' },
  { dayName: 'Jun', dayNumber: 19, dateStr: '2026-09-19' },
  { dayName: 'Jv', dayNumber: 20, dateStr: '2026-09-20' },
  { dayName: 'Sa', dayNumber: 26, dateStr: '2026-09-26' },
  { dayName: 'Do', dayNumber: 27, dateStr: '2026-09-27' },
];

const MOCK_EVENTS = [
  {
    id: '1',
    dayNumber: 2,
    title: 'Estudio Bíblico',
    subtitle: 'Martes',
    description: 'Estudio de discusiones con paranas para mantener el corazón en la iglesia.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1438283173091-5dbf5c5a3206?auto=format&fit=crop&q=80&w=150',
  },
  {
    id: '2',
    dayNumber: 5,
    title: 'Juventud RKA',
    subtitle: 'Jueves',
    description: 'Estudio de promesas concéntricas de Juventud RKA.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=150',
  },
  {
    id: '3',
    dayNumber: 30,
    title: 'Misión Comunitaria',
    subtitle: 'Sábado',
    description: 'Misión comunitaria amanecer en las afueras de los comités.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1593113516832-f3e1a6c0c201?auto=format&fit=crop&q=80&w=150',
  },
];

export function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState('2026-09-17');

  return (
    <View style={styles.container}>
      <AppHeader title="Calendar" />
      
      <WeekCalendarStrip 
        days={MOCK_DAYS}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      <FlatList
        data={MOCK_EVENTS}
        keyExtractor={e => e.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <EventCard {...item} />
        )}
        ListFooterComponent={<View style={{ height: 100 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  list: {
    paddingTop: 16,
  },
});
