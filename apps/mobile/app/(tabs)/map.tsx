import { Heading } from '@/components/Heading';
import { colors, serifText } from '@/lib/theme';
import { useTripsStore } from '@/store/tripsStore';
import { geocodeDestination } from '@trip/ui-core';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

type LocatedTrip = {
  id: string;
  destination: string;
  days: number;
  lat: number;
  lng: number;
};

function buildHtml(accent: string, bg: string): string {
  return `<!doctype html>
<html><head>
<meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<style>
  html,body,#map{height:100%;margin:0;padding:0;background:${bg};}
  .pin{
    width:18px;height:18px;border-radius:50%;
    background:${accent};border:3px solid #fff;
    box-shadow:0 2px 6px rgba(0,0,0,0.25);
  }
  .leaflet-popup-content{font-family:-apple-system,system-ui,sans-serif;margin:10px 14px;}
  .leaflet-popup-content b{font-size:14px;}
  .leaflet-popup-content small{color:#666;}
  .leaflet-popup-content a{color:${accent};font-weight:600;text-decoration:none;display:flex;align-items:center;gap:6px;margin-top:6px;}
  .leaflet-popup-content a svg{display:block;}
</style>
</head><body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
  const map = L.map('map', { zoomControl: false, attributionControl: false }).setView([20,0], 2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map);
  const pinIcon = L.divIcon({ className: '', html: '<div class="pin"></div>', iconSize: [18,18], iconAnchor: [9,9], popupAnchor: [0,0] });
  let markers = [];
  function render(trips){
    markers.forEach(m => m.remove()); markers = [];
    trips.forEach(t => {
      const m = L.marker([t.lat, t.lng], { icon: pinIcon }).addTo(map);
      const html = '<b>' + t.destination + '</b><br/><small>' + t.days + '-day trip</small>' +
        '<a href="#" onclick="window.ReactNativeWebView.postMessage(JSON.stringify({type:\\'open\\',id:\\''+t.id+'\\'}));return false;">Open trip <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg></a>';
      m.bindPopup(html, { offset: [3.5, 12] });
      markers.push(m);
    });
    if (trips.length === 1) map.setView([trips[0].lat, trips[0].lng], 5);
    else if (trips.length > 1) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.3));
    }
  }
  window.__setTrips = render;
  document.addEventListener('message', (e) => {
    try { render(JSON.parse(e.data)); } catch(_){}
  });
  window.addEventListener('message', (e) => {
    try { render(JSON.parse(e.data)); } catch(_){}
  });
  window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({type:'ready'}));
</script>
</body></html>`;
}

export default function MapScreen() {
  const trips = useTripsStore((s) => s.trips);
  const setCoords = useTripsStore((s) => s.setCoords);
  const webRef = useRef<WebView>(null);

  const located = useMemo<LocatedTrip[]>(
    () =>
      trips
        .filter((t) => typeof t.lat === 'number' && typeof t.lng === 'number')
        .map((t) => ({
          id: t.id,
          destination: t.destination,
          days: t.itinerary.days.length,
          lat: t.lat as number,
          lng: t.lng as number,
        })),
    [trips],
  );

  // Lazy backfill: geocode any saved trip still missing coords.
  useEffect(() => {
    for (const t of trips) {
      if (t.lat == null || t.lng == null) {
        geocodeDestination(t.destination).then((c) => {
          if (c) setCoords(t.id, c.lat, c.lng);
        });
      }
    }
  }, [trips, setCoords]);

  // Push markers when data changes.
  useEffect(() => {
    const js = `window.__setTrips && window.__setTrips(${JSON.stringify(located)}); true;`;
    webRef.current?.injectJavaScript(js);
  }, [located]);

  const html = useMemo(() => buildHtml(colors.accent, colors.bg), []);
  const count = located.length;

  return (
    <View className="flex-1 bg-bg">
      <WebView
        ref={webRef}
        originWhitelist={['*']}
        source={{ html }}
        style={{ flex: 1, backgroundColor: colors.bg }}
        onMessage={(e) => {
          try {
            const msg = JSON.parse(e.nativeEvent.data) as {
              type: string;
              id?: string;
            };
            if (msg.type === 'ready') {
              webRef.current?.injectJavaScript(
                `window.__setTrips(${JSON.stringify(located)}); true;`,
              );
            } else if (msg.type === 'open' && msg.id) {
              router.push(`/trip/${msg.id}` as never);
            }
          } catch {}
        }}
      />

      <SafeAreaView
        edges={['top']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0 }}
        pointerEvents="box-none"
      >
        <View
          className="mx-4 mt-2 px-5 py-4 rounded-2xl"
          style={{ backgroundColor: 'rgba(255,255,255,0.96)' }}
        >
          <Text
            style={{
              fontFamily: 'Inter_500Medium',
              fontSize: 11,
              letterSpacing: 1.5,
              color: colors.muted,
            }}
          >
            YOUR PASSPORT
          </Text>
          <Heading size="xl" className="mt-1">
            {count} {count === 1 ? 'destination' : 'destinations'}
          </Heading>
        </View>
      </SafeAreaView>

      {count === 0 && (
        <View pointerEvents="none" className="absolute inset-0 items-center justify-center px-8">
          <Text
            style={{
              ...serifText(20),
              color: colors.muted,
              textAlign: 'center',
            }}
          >
            Save a trip and it'll land on the map here.
          </Text>
        </View>
      )}
    </View>
  );
}
