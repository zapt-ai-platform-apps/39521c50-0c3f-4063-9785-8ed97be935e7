import { createSignal, onMount, For, Show } from 'solid-js';

function App() {
  const countries = [
    { name: 'الإمارات العربية المتحدة', code: 'AE' },
    { name: 'الجزائر', code: 'DZ' },
    { name: 'البحرين', code: 'BH' },
    { name: 'جزر القمر', code: 'KM' },
    { name: 'جيبوتي', code: 'DJ' },
    { name: 'مصر', code: 'EG' },
    { name: 'العراق', code: 'IQ' },
    { name: 'الأردن', code: 'JO' },
    { name: 'الكويت', code: 'KW' },
    { name: 'لبنان', code: 'LB' },
    { name: 'ليبيا', code: 'LY' },
    { name: 'موريتانيا', code: 'MR' },
    { name: 'المغرب', code: 'MA' },
    { name: 'عمان', code: 'OM' },
    { name: 'فلسطين', code: 'PS' },
    { name: 'قطر', code: 'QA' },
    { name: 'المملكة العربية السعودية', code: 'SA' },
    { name: 'الصومال', code: 'SO' },
    { name: 'السودان', code: 'SD' },
    { name: 'سوريا', code: 'SY' },
    { name: 'تونس', code: 'TN' },
    { name: 'اليمن', code: 'YE' },
  ];

  const [selectedCountryCode, setSelectedCountryCode] = createSignal('');
  const [stations, setStations] = createSignal([]);
  const [currentStation, setCurrentStation] = createSignal(null);
  const [isPlaying, setIsPlaying] = createSignal(false);
  const [loadingStations, setLoadingStations] = createSignal(false);
  const [playingStationId, setPlayingStationId] = createSignal(null);
  let audioPlayer;

  const fetchStations = async () => {
    if (!selectedCountryCode()) return;
    setLoadingStations(true);
    setStations([]);
    try {
      const response = await fetch(
        `https://de1.api.radio-browser.info/json/stations/bycountrycodeexact/${selectedCountryCode()}`
      );
      const data = await response.json();
      setStations(data.filter(station => station.url_resolved));
    } catch (error) {
      console.error('Error fetching stations:', error);
    } finally {
      setLoadingStations(false);
    }
  };

  const playStation = (station) => {
    if (audioPlayer) {
      audioPlayer.pause();
    }
    audioPlayer = new Audio(station.url_resolved);
    audioPlayer.play();
    setCurrentStation(station);
    setIsPlaying(true);
    setPlayingStationId(station.stationuuid);
    audioPlayer.onended = () => {
      setIsPlaying(false);
      setPlayingStationId(null);
    };
    audioPlayer.onerror = () => {
      console.error('Error playing station:', audioPlayer.error);
      stopStation();
    };
  };

  const stopStation = () => {
    if (audioPlayer) {
      audioPlayer.pause();
      audioPlayer = null;
    }
    setIsPlaying(false);
    setCurrentStation(null);
    setPlayingStationId(null);
  };

  onMount(() => {
    document.documentElement.dir = 'rtl';
  });

  return (
    <div class="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-4 text-gray-800">
      <div class="h-full max-w-4xl mx-auto">
        <h1 class="text-4xl font-bold mb-8 text-center text-purple-600">راديو عربي متقدم</h1>
        <div class="mb-4">
          <label class="block text-xl font-semibold mb-2 text-purple-700">اختر البلد:</label>
          <select
            class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent box-border cursor-pointer"
            onChange={(e) => {
              setSelectedCountryCode(e.target.value);
              fetchStations();
            }}
          >
            <option value="">-- اختر البلد --</option>
            <For each={countries}>
              {(country) => (
                <option value={country.code}>{country.name}</option>
              )}
            </For>
          </select>
        </div>
        <Show when={loadingStations()}>
          <div class="text-center text-xl text-purple-600">جارٍ تحميل المحطات...</div>
        </Show>
        <Show when={!loadingStations() && stations().length > 0}>
          <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <For each={stations()}>
              {(station) => (
                <div class="bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
                  <div>
                    <p class="font-semibold text-lg text-purple-700">{station.name}</p>
                    <p class="text-sm text-gray-500">{station.tags}</p>
                  </div>
                  <button
                    class={`bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105 ${
                      playingStationId() === station.stationuuid ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                    onClick={() => playStation(station)}
                    disabled={playingStationId() === station.stationuuid}
                  >
                    تشغيل
                  </button>
                </div>
              )}
            </For>
          </div>
        </Show>
        <Show when={!loadingStations() && stations().length === 0 && selectedCountryCode()}>
          <div class="text-center text-xl text-purple-600">لا توجد محطات متاحة لهذا البلد.</div>
        </Show>
        <Show when={currentStation()}>
          <div class="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-inner flex items-center justify-between">
            <p class="font-semibold text-lg text-purple-700">{currentStation().name}</p>
            <button
              class="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-full cursor-pointer transition duration-300 ease-in-out transform hover:scale-105"
              onClick={stopStation}
            >
              إيقاف
            </button>
          </div>
        </Show>
      </div>
    </div>
  );
}

export default App;