import { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, SafeAreaView, TouchableOpacity } from "react-native";
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import {Platform} from 'react-native';

type SportType = 'boxing' | 'mma';

interface FightEvent {
  // Boxing fields
  event_id?: string;
  event_title?: string;
  title?: string;
  event_date?: string;
  date?: string;
  venue?: string;
  location?: string;
  
  // MMA fields
  id?: string;
  name?: string;
  startTimestamp?: number;
  status?: {
    type?: string;
  };
  tournament?: {
    name?: string;
    category?: {
      name?: string;
    };
  };
  homeTeam?: {
    name?: string;
  };
  awayTeam?: {
    name?: string;
  };
}

export default function App() {
  const [events, setEvents] = useState<FightEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSport, setCurrentSport] = useState<SportType>('boxing');
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const fetchBoxingEvents = async () => {
    const url = "https://boxing-data-api.p.rapidapi.com/v1/events/schedule?days=7&past_hours=12&date_sort=ASC&page_num=1&page_size=25";
    const options = {
      method: "GET",
      headers: {
        "x-rapidapi-host": "boxing-data-api.p.rapidapi.com",
        "x-rapidapi-key": "16ccf2114cmshe411b5b592feca2p11a6dajsnde32158908c1",
      },
    };

    console.log('Fetching boxing events...');
    const response = await fetch(url, options);
    const data = await response.json();
    console.log('Boxing API Response:', data);
    
    if (data.data && Array.isArray(data.data)) {
      return data.data;
    } else if (Array.isArray(data)) {
      return data;
    }
    return [];
  };

  const fetchMMAEvents = async () => {
    const url = "https://mmaapi.p.rapidapi.com/api/mma/unique-tournament/19906/schedules/15/9/2024";
    const options = {
      method: "GET",
      headers: {
        "x-rapidapi-host": "mmaapi.p.rapidapi.com",
        "x-rapidapi-key": "16ccf2114cmshe411b5b592feca2p11a6dajsnde32158908c1",
      },
    };

    console.log('Fetching MMA events...');
    const response = await fetch(url, options);
    const data = await response.json();
    console.log('MMA API Response:', data);
    
    if (data.events && Array.isArray(data.events)) {
      return data.events;
    } else if (Array.isArray(data)) {
      return data;
    }
    return [];
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let fetchedEvents: FightEvent[] = [];
        
        if (currentSport === 'boxing') {
          fetchedEvents = await fetchBoxingEvents();
        } else {
          fetchedEvents = await fetchMMAEvents();
        }
        
        setEvents(fetchedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [currentSport]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>SupaBox</Text>
          <Text style={styles.headerSubtitle}>Your Combat Sports Hub</Text>
        </View>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            Upcoming {currentSport === 'boxing' ? 'Boxing' : 'MMA'} Events
          </Text>
          <ActivityIndicator size="large" color={colors.tint} style={styles.loader} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading {currentSport === 'boxing' ? 'boxing' : 'MMA'} events...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>SupaBox</Text>
          <Text style={styles.headerSubtitle}>Your Combat Sports Hub</Text>
        </View>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            Upcoming {currentSport === 'boxing' ? 'Boxing' : 'MMA'} Events
          </Text>
          <Text style={[styles.errorText, { color: 'red' }]}>
            Error: {error}
          </Text>
          <Text style={[styles.description, { color: colors.text }]}>
            Please check your internet connection and try again.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderEventCard = (event: FightEvent, index: number) => {
    if (currentSport === 'boxing') {
      return (
        <View key={event.event_id || index} style={[styles.eventCard, styles.boxingCard, { backgroundColor: colors.background, borderColor: colors.icon }]}>
          <Text style={[styles.eventTitle, { color: colors.text }]}>
            {event.event_title || event.title || 'Boxing Event'}
          </Text>
          <Text style={[styles.eventDate, { color: colors.text }]}>
            Date: {event.event_date || event.date || 'TBA'}
          </Text>
          <Text style={[styles.eventLocation, { color: colors.text }]}>
            Location: {event.venue || event.location || 'TBA'}
          </Text>
        </View>
      );
    } else {
      // MMA Event
      const eventDate = event.startTimestamp ? new Date(event.startTimestamp * 1000).toLocaleDateString() : 'TBA';
      const eventTime = event.startTimestamp ? new Date(event.startTimestamp * 1000).toLocaleTimeString() : '';
      const fighters = event.homeTeam && event.awayTeam ? `${event.homeTeam.name} vs ${event.awayTeam.name}` : event.name || 'MMA Fight';
      
      return (
        <View key={event.id || index} style={[styles.eventCard, styles.mmaCard, { backgroundColor: colors.background, borderColor: colors.icon }]}>
          <Text style={[styles.eventTitle, { color: colors.text }]}>
            {fighters}
          </Text>
          <Text style={[styles.eventDate, { color: colors.text }]}>
            Date: {eventDate} {eventTime}
          </Text>
          <Text style={[styles.eventLocation, { color: colors.text }]}>
            Tournament: {event.tournament?.name || 'MMA Event'}
          </Text>
          {event.status?.type && (
            <Text style={[styles.eventStatus, { color: colors.tint }]}>
              Status: {event.status.type}
            </Text>
          )}
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>SupaBox</Text>
        <Text style={styles.headerSubtitle}>Your Combat Sports Hub</Text>
        
        {/* Sport Toggle Buttons */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              currentSport === 'boxing' ? styles.activeToggle : styles.inactiveToggle
            ]}
            onPress={() => setCurrentSport('boxing')}
          >
            <Text style={[
              styles.toggleText,
              { color: currentSport === 'boxing' ? '#fff' : colors.text }
            ]}>
              🥊 Boxing
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.toggleButton,
              currentSport === 'mma' ? styles.activeToggle : styles.inactiveToggle
            ]}
            onPress={() => setCurrentSport('mma')}
          >
            <Text style={[
              styles.toggleText,
              { color: currentSport === 'mma' ? '#fff' : colors.text }
            ]}>
              🥋 MMA
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView 
        style={[styles.container, { backgroundColor: colors.background }]} 
        showsVerticalScrollIndicator={false}
        bounces={true}
        bouncesZoom={true}
        alwaysBounceVertical={true}
        decelerationRate="normal"
        scrollEventThrottle={16}
      >
        <Text style={[styles.title, { color: colors.text }]}>
          Upcoming {currentSport === 'boxing' ? 'Boxing' : 'MMA'} Events
        </Text>
        
        {events.length === 0 ? (
          <Text style={[styles.noEventsText, { color: colors.text }]}>
            No upcoming {currentSport === 'boxing' ? 'boxing' : 'MMA'} events found.
          </Text>
        ) : (
          events.map((event, index) => renderEventCard(event, index))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B35',
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
    letterSpacing: 0.5,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  loader: {
    marginTop: 50,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    fontSize: 14,
  },
  noEventsText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 50,
  },
  eventCard: {
    marginBottom: 15,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  eventDate: {
    fontSize: 14,
    marginBottom: 3,
  },
  eventLocation: {
    fontSize: 14,
  },
  eventStatus: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 5,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginTop: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeToggle: {
    backgroundColor: '#FF6B35',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  inactiveToggle: {
    backgroundColor: 'transparent',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  boxingCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
  },
  mmaCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
});
