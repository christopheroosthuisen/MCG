
import React, { useState } from 'react';
import { ScreenHeader, Card, Badge, Button } from './UIComponents';
import { COLORS } from '../constants';

// --- TYPES ---
type WeatherCondition = 'SUNNY' | 'PARTLY_CLOUDY' | 'CLOUDY' | 'RAINY' | 'STORMY' | 'WINDY' | 'FOGGY';
type WindDirection = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';
type PlayabilityRating = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'UNPLAYABLE';

interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windGust: number;
  windDirection: WindDirection;
  condition: WeatherCondition;
  uvIndex: number;
  precipitation: number;
  updatedAt: Date;
}

interface HourlyForecast {
  hour: Date;
  temperature: number;
  condition: WeatherCondition;
  windSpeed: number;
  precipProbability: number;
}

interface DailyForecast {
  date: Date;
  high: number;
  low: number;
  condition: WeatherCondition;
  precipProbability: number;
}

// --- MOCK DATA ---
const MOCK_CURRENT_WEATHER: CurrentWeather = {
  temperature: 72,
  feelsLike: 74,
  humidity: 45,
  windSpeed: 12,
  windGust: 18,
  windDirection: 'SW',
  condition: 'PARTLY_CLOUDY',
  uvIndex: 7,
  precipitation: 0,
  updatedAt: new Date(),
};

const MOCK_HOURLY: HourlyForecast[] = Array.from({ length: 8 }, (_, i) => ({
  hour: new Date(Date.now() + i * 3600000),
  temperature: 72 + Math.round(Math.sin(i) * 5),
  condition: i < 3 ? 'SUNNY' : 'CLOUDY',
  windSpeed: 10 + i,
  precipProbability: i > 5 ? 30 : 0
}));

const MOCK_DAILY: DailyForecast[] = [
    { date: new Date(), high: 78, low: 58, condition: 'PARTLY_CLOUDY', precipProbability: 10 },
    { date: new Date(Date.now() + 86400000), high: 75, low: 55, condition: 'SUNNY', precipProbability: 0 },
    { date: new Date(Date.now() + 172800000), high: 68, low: 52, condition: 'RAINY', precipProbability: 80 },
];

const WEATHER_ICONS: Record<WeatherCondition, string> = {
  SUNNY: '☀️', PARTLY_CLOUDY: '⛅', CLOUDY: '☁️', RAINY: '🌧️',
  STORMY: '⛈️', WINDY: '💨', FOGGY: '🌫️',
};

const WIND_ANGLES: Record<WindDirection, number> = {
  N: 0, NE: 45, E: 90, SE: 135, S: 180, SW: 225, W: 270, NW: 315,
};

// --- LOGIC ---
const calculatePlayability = (w: CurrentWeather): PlayabilityRating => {
    if (w.condition === 'STORMY' || w.windSpeed > 30) return 'UNPLAYABLE';
    if (w.condition === 'RAINY' || w.temperature < 45 || w.windSpeed > 20) return 'POOR';
    if (w.temperature < 60 || w.windSpeed > 15) return 'FAIR';
    if (w.temperature > 85) return 'GOOD';
    return 'EXCELLENT';
};

const getDistanceAdjustments = (w: CurrentWeather, altitude: number = 0) => {
    const adjs = [];
    const tempDiff = w.temperature - 70;
    if (Math.abs(tempDiff) > 10) adjs.push({ label: 'Temp', val: Math.round(tempDiff * 0.15), unit: '%' });
    if (altitude > 1000) adjs.push({ label: 'Altitude', val: Math.round((altitude/1000)*2), unit: '%' });
    if (w.windSpeed > 10) adjs.push({ label: 'Wind', val: 0, unit: 'varies' });
    return adjs;
};

// --- COMPONENTS ---

export const WeatherView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState<'CONDITIONS' | 'FORECAST'>('CONDITIONS');
    const weather = MOCK_CURRENT_WEATHER;
    const playability = calculatePlayability(weather);
    const adjustments = getDistanceAdjustments(weather, 1200);

    const playabilityColor = 
        playability === 'EXCELLENT' ? 'bg-green-500' :
        playability === 'GOOD' ? 'bg-green-400' :
        playability === 'FAIR' ? 'bg-yellow-500' :
        playability === 'POOR' ? 'bg-orange-500' : 'bg-red-500';

    return (
        <div className="bg-[#F5F5F7] min-h-screen pb-32 animate-in slide-in-from-right duration-300">
            <ScreenHeader 
                title="Weather Center"
                subtitle="Course Conditions"
                leftAction={
                    <button onClick={onBack} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    </button>
                }
            />

            <div className="px-4 space-y-6">
                {/* Main Card */}
                <div className="rounded-3xl p-6 text-white shadow-xl relative overflow-hidden bg-gradient-to-br from-sky-500 to-blue-600">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="font-bold text-lg">Pebble Beach, CA</div>
                            <div className="text-xs opacity-80">Updated 2m ago</div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider ${playabilityColor}`}>
                            {playability} Golf
                        </div>
                    </div>

                    <div className="flex items-center gap-6 mb-6">
                        <div className="text-6xl">{WEATHER_ICONS[weather.condition]}</div>
                        <div>
                            <div className="text-6xl font-black leading-none">{weather.temperature}°</div>
                            <div className="opacity-90 font-medium">Feels like {weather.feelsLike}°</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                        <div className="text-center">
                            <div className="text-lg font-bold">{weather.windSpeed}</div>
                            <div className="text-[10px] opacity-75 uppercase">Wind</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold">{weather.humidity}<span className="text-xs">%</span></div>
                            <div className="text-[10px] opacity-75 uppercase">Hum</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold">{weather.uvIndex}</div>
                            <div className="text-[10px] opacity-75 uppercase">UV</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold">{weather.precipitation}<span className="text-xs">%</span></div>
                            <div className="text-[10px] opacity-75 uppercase">Rain</div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex bg-white rounded-xl p-1 shadow-sm">
                    {['CONDITIONS', 'FORECAST'].map(t => (
                        <button 
                            key={t}
                            onClick={() => setActiveTab(t as any)}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === t ? 'bg-gray-900 text-white shadow' : 'text-gray-500'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {activeTab === 'CONDITIONS' && (
                    <div className="space-y-4">
                        {/* Wind Compass */}
                        <Card className="p-5 flex items-center gap-6">
                            <div className="relative w-24 h-24 flex-shrink-0">
                                <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                                {['N','E','S','W'].map((d, i) => (
                                    <div key={d} className={`absolute text-[10px] font-bold text-gray-400
                                        ${d==='N'?'top-1 left-1/2 -translate-x-1/2':''}
                                        ${d==='S'?'bottom-1 left-1/2 -translate-x-1/2':''}
                                        ${d==='W'?'left-1 top-1/2 -translate-y-1/2':''}
                                        ${d==='E'?'right-1 top-1/2 -translate-y-1/2':''}
                                    `}>{d}</div>
                                ))}
                                <div 
                                    className="absolute top-1/2 left-1/2 w-1 h-10 bg-orange-500 rounded-full origin-bottom -mt-10"
                                    style={{ transform: `translateX(-50%) rotate(${WIND_ANGLES[weather.windDirection]}deg)` }}
                                >
                                    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[12px] border-b-orange-500 absolute -top-2 -left-[5px]"></div>
                                </div>
                                <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-gray-800 rounded-full -translate-x-1/2 -translate-y-1/2 border-2 border-white"></div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 uppercase font-bold mb-1">Wind Direction</div>
                                <div className="text-3xl font-black text-gray-900 mb-1">{weather.windDirection}</div>
                                <div className="text-sm font-medium text-gray-600">{weather.windSpeed} mph <span className="text-orange-500 font-bold">Gusts {weather.windGust}</span></div>
                            </div>
                        </Card>

                        {/* Smart Distance */}
                        <Card className="p-5">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-gray-900">Distance Adjustments</h3>
                                <Badge variant="info">Smart Caddie</Badge>
                            </div>
                            
                            <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4 mb-4">
                                <div className="text-center">
                                    <div className="text-xs text-gray-400 font-bold uppercase mb-1">Stock 7i</div>
                                    <div className="text-xl font-black text-gray-900">165y</div>
                                </div>
                                <div className="text-gray-300">➜</div>
                                <div className="text-center">
                                    <div className="text-xs text-green-600 font-bold uppercase mb-1">Plays Like</div>
                                    <div className="text-xl font-black text-green-600">172y</div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {adjustments.map((adj, i) => (
                                    <div key={i} className="flex justify-between text-sm py-1 border-b border-gray-50 last:border-0">
                                        <span className="text-gray-600">{adj.label}</span>
                                        <span className={`font-bold ${adj.val > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                            {adj.val > 0 ? '+' : ''}{adj.val}{adj.unit}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Course Status */}
                        <Card className="p-5">
                            <h3 className="font-bold text-gray-900 mb-4">Course Status</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                                    <div className="text-xs text-green-700 font-bold mb-1">Green Speed</div>
                                    <div className="text-xl font-black text-green-900">11.5</div>
                                </div>
                                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                                    <div className="text-xs text-blue-700 font-bold mb-1">Cart Rule</div>
                                    <div className="text-sm font-bold text-blue-900">90 Degree</div>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {activeTab === 'FORECAST' && (
                    <div className="space-y-4">
                        <Card className="p-4 overflow-hidden">
                            <h3 className="font-bold text-gray-900 mb-4">Hourly</h3>
                            <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
                                {MOCK_HOURLY.map((h, i) => (
                                    <div key={i} className={`flex-shrink-0 text-center min-w-[60px] p-2 rounded-xl ${i===0 ? 'bg-orange-50 ring-1 ring-orange-200' : ''}`}>
                                        <div className="text-xs text-gray-500 mb-1">{i===0 ? 'Now' : h.hour.getHours() + (h.hour.getHours() >= 12 ? 'pm' : 'am')}</div>
                                        <div className="text-2xl mb-1">{WEATHER_ICONS[h.condition]}</div>
                                        <div className="font-bold text-gray-900">{h.temperature}°</div>
                                        {h.precipProbability > 0 && <div className="text-[10px] text-blue-500 font-bold mt-1">{h.precipProbability}%</div>}
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card className="p-4">
                            <h3 className="font-bold text-gray-900 mb-4">5-Day Outlook</h3>
                            <div className="space-y-4">
                                {MOCK_DAILY.map((d, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="w-12 font-medium text-gray-900 text-sm">
                                            {d.date.toLocaleDateString('en-US', { weekday: 'short' })}
                                        </div>
                                        <div className="text-xl">{WEATHER_ICONS[d.condition]}</div>
                                        <div className="flex gap-3 text-sm">
                                            <span className="font-bold">{d.high}°</span>
                                            <span className="text-gray-400">{d.low}°</span>
                                        </div>
                                        <div className="w-12 text-right text-xs text-blue-500 font-bold">
                                            {d.precipProbability > 0 ? `${d.precipProbability}%` : ''}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};
