import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Compass, Crown, Sparkles, Building2 } from 'lucide-react';
import { ReincarnationResultData } from '../types';

interface ReincarnationMapProps {
  currentResult: ReincarnationResultData | null;
}

// Custom DivIcon for Born City with distinct status styling
const createBornCityIcon = (
  cityName: string,
  isCapital: boolean,
  isLargest: boolean,
  isMajor: boolean
) => {
  let iconEmoji = '📍';
  let badgeText = '[태어난 곳]';
  let badgeColor = 'text-rose-400 border-rose-500/50';
  let pinGradient = 'from-rose-600 to-red-500';
  let pingColor = 'bg-rose-500';

  if (isCapital && isLargest) {
    iconEmoji = '👑';
    badgeText = '[수도 · 최대도시]';
    badgeColor = 'text-amber-300 border-amber-400/60';
    pinGradient = 'from-amber-500 via-purple-600 to-indigo-600';
    pingColor = 'bg-amber-400';
  } else if (isCapital) {
    iconEmoji = '🏛️';
    badgeText = '[국가 수도]';
    badgeColor = 'text-amber-300 border-amber-400/60';
    pinGradient = 'from-amber-500 to-yellow-600';
    pingColor = 'bg-amber-400';
  } else if (isLargest) {
    iconEmoji = '🌟';
    badgeText = '[국가 최대도시]';
    badgeColor = 'text-emerald-300 border-emerald-400/60';
    pinGradient = 'from-emerald-500 to-teal-600';
    pingColor = 'bg-emerald-400';
  } else if (isMajor) {
    iconEmoji = '🏙️';
    badgeText = '[주요 대도시]';
    badgeColor = 'text-blue-300 border-blue-400/50';
    pinGradient = 'from-blue-600 to-indigo-500';
    pingColor = 'bg-blue-400';
  }

  return L.divIcon({
    className: 'custom-born-marker',
    html: `
      <div class="relative flex flex-col items-center group">
        <div class="relative flex items-center justify-center">
          <span class="animate-ping absolute inline-flex h-9 w-9 rounded-full ${pingColor} opacity-70"></span>
          <span class="relative inline-flex rounded-full h-8 w-8 bg-gradient-to-tr ${pinGradient} border-2 border-white shadow-2xl items-center justify-center text-white text-xs font-black">
            ${iconEmoji}
          </span>
        </div>
        <div class="mt-1 whitespace-nowrap bg-slate-900/95 backdrop-blur-md text-white text-[11px] font-extrabold px-2.5 py-1 rounded-lg shadow-lg border ${badgeColor}">
          ${cityName} <span class="font-bold">${badgeText}</span>
        </div>
      </div>
    `,
    iconSize: [40, 50],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
};

// Custom DivIcon for Nearest Major City
const createMajorCityIcon = (cityName: string) => {
  return L.divIcon({
    className: 'custom-major-marker',
    html: `
      <div class="relative flex flex-col items-center group">
        <div class="relative flex items-center justify-center">
          <span class="relative inline-flex rounded-full h-8 w-8 bg-gradient-to-tr from-indigo-600 to-blue-500 border-2 border-white shadow-xl items-center justify-center text-white text-xs font-black">
            🏙️
          </span>
        </div>
        <div class="mt-1 whitespace-nowrap bg-slate-900/90 backdrop-blur-md text-white text-[11px] font-extrabold px-2.5 py-1 rounded-lg shadow-lg border border-indigo-400/50">
          ${cityName} <span class="text-indigo-300 font-bold">[주변 대도시]</span>
        </div>
      </div>
    `,
    iconSize: [36, 48],
    iconAnchor: [18, 20],
    popupAnchor: [0, -20],
  });
};

// Map View Bounds Controller
const MapBoundsController: React.FC<{
  bornLat: number;
  bornLng: number;
  majorLat: number | null;
  majorLng: number | null;
  isInitial: boolean;
}> = ({ bornLat, bornLng, majorLat, majorLng, isInitial }) => {
  const map = useMap();

  useEffect(() => {
    if (isInitial) {
      map.setView([20, 0], 2);
      return;
    }

    if (majorLat === null || majorLng === null) {
      // If born in an already major/capital city, zoom directly
      map.flyTo([bornLat, bornLng], 7, { duration: 1.5 });
      return;
    }

    const bounds = L.latLngBounds([
      [bornLat, bornLng],
      [majorLat, majorLng],
    ]);

    map.flyToBounds(bounds, {
      padding: [60, 60],
      maxZoom: 9,
      duration: 1.5,
    });
  }, [bornLat, bornLng, majorLat, majorLng, isInitial, map]);

  return null;
};

export const ReincarnationMap: React.FC<ReincarnationMapProps> = ({ currentResult }) => {
  const defaultCenter: [number, number] = [20, 10];
  const isInitial = !currentResult;

  const bornPos: [number, number] = currentResult
    ? [currentResult.city.lat, currentResult.city.lng]
    : defaultCenter;

  const isCapital = Boolean(
    currentResult?.city.is_capital || currentResult?.city.capital === 'primary'
  );
  const isLargest = Boolean(currentResult?.city.is_largest_city);
  const hasMajorCity = Boolean(currentResult?.city.nearest_major_city);
  const isAlreadyMajorCity = Boolean(
    isCapital || isLargest || currentResult?.city.is_major_city || !hasMajorCity
  );

  const majorPos: [number, number] | null =
    hasMajorCity && currentResult?.city.nearest_major_city
      ? [
          currentResult.city.nearest_major_city.lat,
          currentResult.city.nearest_major_city.lng,
        ]
      : null;

  const distanceKm = currentResult?.calculatedDistanceKm ?? null;

  return (
    <div className="bg-white rounded-3xl p-3 sm:p-4 border border-slate-200 shadow-sm mb-6 overflow-hidden relative">
      {/* Top Map Bar */}
      <div className="flex items-center justify-between px-2 py-1.5 mb-2 text-xs font-semibold text-slate-600">
        <div className="flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-indigo-600 animate-spin-slow" />
          <span>지구 궤도 위치 레이더 (OpenStreetMap)</span>
        </div>
        {currentResult && (
          <div className="text-[11px] text-slate-500 font-mono">
            {bornPos[0].toFixed(2)}°N, {bornPos[1].toFixed(2)}°E
          </div>
        )}
      </div>

      <div className="w-full h-[320px] sm:h-[420px] md:h-[480px] rounded-2xl overflow-hidden relative z-0 border border-slate-200">
        <MapContainer
          center={defaultCenter}
          zoom={2}
          scrollWheelZoom={true}
          className="w-full h-full"
          style={{ background: '#f1f5f9' }}
        >
          {/* Free Standard OpenStreetMap Tile Layer */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {currentResult && (
            <>
              {/* Born City Marker */}
              <Marker
                position={bornPos}
                icon={createBornCityIcon(
                  currentResult.city.name,
                  isCapital,
                  isLargest,
                  isAlreadyMajorCity
                )}
              >
                <Popup>
                  <div className="text-xs font-sans p-1">
                    <div className="font-bold text-indigo-600 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>
                        {isCapital && isLargest
                          ? '👑 국가 수도 & 최대도시'
                          : isCapital
                          ? '🏛️ 국가 수도 직할지'
                          : isLargest
                          ? '🌟 국가 제1의 최대도시'
                          : isAlreadyMajorCity
                          ? '🏙️ 권역 대표 대도시'
                          : '📍 태어난 지역'}
                      </span>
                    </div>
                    <div className="text-sm font-black text-slate-900 mt-1">
                      {currentResult.city.name}
                    </div>
                    <div className="text-slate-600 mt-0.5">
                      국가: {currentResult.country.country_ko} ({currentResult.country.country})
                    </div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      인구: {currentResult.city.population.toLocaleString()}명
                    </div>
                  </div>
                </Popup>
              </Marker>

              {/* Nearest Major City Marker (Only if NOT already in a major/capital city) */}
              {!isAlreadyMajorCity && majorPos && currentResult.city.nearest_major_city && (
                <Marker
                  position={majorPos}
                  icon={createMajorCityIcon(
                    currentResult.city.nearest_major_city.name
                  )}
                >
                  <Popup>
                    <div className="text-xs font-sans p-1">
                      <div className="font-bold text-indigo-600 flex items-center gap-1">
                        <Navigation className="w-3.5 h-3.5" />
                        <span>가장 가까운 알 만한 대도시</span>
                      </div>
                      <div className="text-sm font-black text-slate-900 mt-1">
                        {currentResult.city.nearest_major_city.name}
                      </div>
                      <div className="text-slate-600 mt-0.5">
                        인구: {currentResult.city.nearest_major_city.population.toLocaleString()}명
                      </div>
                      {distanceKm !== null && (
                        <div className="text-rose-600 font-bold text-[11px] mt-1 bg-rose-50 p-1 rounded">
                          직선거리: 약 {distanceKm.toLocaleString()} km (Haversine 공식)
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Polyline (Only if NOT already in a major/capital city) */}
              {!isAlreadyMajorCity && majorPos && (
                <Polyline
                  positions={[bornPos, majorPos]}
                  pathOptions={{
                    color: '#6366f1',
                    weight: 3.5,
                    dashArray: '6, 8',
                    opacity: 0.9,
                  }}
                />
              )}

              <MapBoundsController
                bornLat={bornPos[0]}
                bornLng={bornPos[1]}
                majorLat={majorPos ? majorPos[0] : null}
                majorLng={majorPos ? majorPos[1] : null}
                isInitial={isInitial}
              />
            </>
          )}
        </MapContainer>

        {/* Floating Badge on Top of Map */}
        {currentResult && (
          <div className="absolute top-3 right-3 z-[1000] bg-slate-900/95 text-white backdrop-blur-md px-3.5 py-2 rounded-xl shadow-xl border border-slate-700/80 text-xs font-medium flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
            </span>
            <span>
              {isCapital && isLargest ? (
                <span className="font-bold text-amber-300 flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5 inline text-amber-400" />
                  <span>{currentResult.city.name} (국가 수도 & 최대 메가시티 직할 탄생!)</span>
                </span>
              ) : isCapital ? (
                <span className="font-bold text-amber-300 flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5 inline text-amber-400" />
                  <span>{currentResult.city.name} (국가 공식 수도 직할지 탄생!)</span>
                </span>
              ) : isLargest ? (
                <span className="font-bold text-emerald-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 inline text-emerald-400" />
                  <span>{currentResult.city.name} (국가 제1의 최대 경제 메트로폴리스!)</span>
                </span>
              ) : isAlreadyMajorCity || !currentResult.city.nearest_major_city ? (
                <span className="font-bold text-blue-300 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 inline text-blue-400" />
                  <span>{currentResult.city.name} (권역 거점 대도시 탄생)</span>
                </span>
              ) : (
                <>
                  <span className="text-rose-300 font-bold">{currentResult.city.name}</span>
                  <span className="text-slate-400 mx-1.5">➔</span>
                  <span className="text-indigo-300 font-bold">
                    {currentResult.city.nearest_major_city.name}
                  </span>
                  {distanceKm !== null && (
                    <span className="bg-indigo-600/60 text-white font-mono font-bold ml-2 px-2 py-0.5 rounded text-[11px] border border-indigo-400/40">
                      약 {distanceKm.toLocaleString()} km
                    </span>
                  )}
                </>
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
