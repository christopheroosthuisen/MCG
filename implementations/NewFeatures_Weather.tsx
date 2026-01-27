/**
 * NewFeatures_Weather.tsx
 * Weather & Course Conditions System for MCG Golf App
 *
 * Inspired by: Weather Underground, The Weather Channel Golf, AccuWeather
 *
 * Features:
 * - Real-time weather dashboard
 * - Course conditions tracking
 * - Weather-based adjustments
 * - Safety alerts and planning
 */

import React, { useState, useEffect } from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type WeatherCondition = 'SUNNY' | 'PARTLY_CLOUDY' | 'CLOUDY' | 'RAINY' | 'STORMY' | 'WINDY' | 'FOGGY';
type WindDirection = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';
type PlayabilityRating = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'UNPLAYABLE';
type AlertSeverity = 'INFO' | 'WARNING' | 'SEVERE';

interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windGust: number;
  windDirection: WindDirection;
  condition: WeatherCondition;
  uvIndex: number;
  visibility: number;
  pressure: number;
  dewPoint: number;
  precipitation: number;
  updatedAt: Date;
}

interface HourlyForecast {
  hour: Date;
  temperature: number;
  condition: WeatherCondition;
  windSpeed: number;
  windDirection: WindDirection;
  precipProbability: number;
}

interface DailyForecast {
  date: Date;
  high: number;
  low: number;
  condition: WeatherCondition;
  precipProbability: number;
  sunrise: string;
  sunset: string;
}

interface CourseConditions {
  greenSpeed: number; // Stimpmeter reading
  fairwayFirmness: 'SOFT' | 'MEDIUM' | 'FIRM';
  greenFirmness: 'SOFT' | 'MEDIUM' | 'FIRM';
  roughHeight: number; // inches
  bunkerCondition: 'FLUFFY' | 'PACKED' | 'WET';
  cartRule: 'PATH_ONLY' | 'FAIRWAY_OK' | '90_DEGREE' | 'CLOSED';
  lastUpdated: Date;
  notes: string[];
}

interface WeatherAlert {
  id: string;
  type: 'LIGHTNING' | 'HEAT' | 'WIND' | 'RAIN' | 'FOG';
  severity: AlertSeverity;
  title: string;
  message: string;
  startTime: Date;
  endTime?: Date;
  isActive: boolean;
}

interface DistanceAdjustment {
  factor: string;
  adjustment: number;
  description: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const COLORS = {
  primary: '#FF8200',
  secondary: '#115740',
  background: '#F5F5F5',
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#FAFAFA',
    100: '#F7F7F7',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
  },
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  sky: '#0EA5E9',
  sun: '#FBBF24',
};

const WEATHER_ICONS: Record<WeatherCondition, string> = {
  SUNNY: '☀️',
  PARTLY_CLOUDY: '⛅',
  CLOUDY: '☁️',
  RAINY: '🌧️',
  STORMY: '⛈️',
  WINDY: '💨',
  FOGGY: '🌫️',
};

const PLAYABILITY_CONFIG: Record<PlayabilityRating, { color: string; label: string }> = {
  EXCELLENT: { color: COLORS.success, label: 'Excellent' },
  GOOD: { color: '#84CC16', label: 'Good' },
  FAIR: { color: COLORS.warning, label: 'Fair' },
  POOR: { color: COLORS.error, label: 'Poor' },
  UNPLAYABLE: { color: '#7C3AED', label: 'Unplayable' },
};

const WIND_DIRECTION_DEGREES: Record<WindDirection, number> = {
  N: 0, NE: 45, E: 90, SE: 135, S: 180, SW: 225, W: 270, NW: 315,
};

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_CURRENT_WEATHER: CurrentWeather = {
  temperature: 72,
  feelsLike: 74,
  humidity: 45,
  windSpeed: 12,
  windGust: 18,
  windDirection: 'SW',
  condition: 'PARTLY_CLOUDY',
  uvIndex: 7,
  visibility: 10,
  pressure: 30.12,
  dewPoint: 52,
  precipitation: 0,
  updatedAt: new Date(),
};

const MOCK_HOURLY_FORECAST: HourlyForecast[] = Array.from({ length: 12 }, (_, i) => ({
  hour: new Date(Date.now() + i * 60 * 60 * 1000),
  temperature: 72 + Math.sin(i / 3) * 8,
  condition: i < 6 ? 'SUNNY' : i < 9 ? 'PARTLY_CLOUDY' : 'CLOUDY',
  windSpeed: 10 + Math.random() * 8,
  windDirection: ['SW', 'S', 'SE'][Math.floor(i / 4)] as WindDirection,
  precipProbability: i > 8 ? 20 + i * 5 : 5,
}));

const MOCK_DAILY_FORECAST: DailyForecast[] = [
  { date: new Date(), high: 78, low: 58, condition: 'PARTLY_CLOUDY', precipProbability: 10, sunrise: '6:32 AM', sunset: '7:15 PM' },
  { date: new Date(Date.now() + 86400000), high: 75, low: 55, condition: 'SUNNY', precipProbability: 5, sunrise: '6:31 AM', sunset: '7:16 PM' },
  { date: new Date(Date.now() + 86400000 * 2), high: 72, low: 54, condition: 'CLOUDY', precipProbability: 30, sunrise: '6:30 AM', sunset: '7:17 PM' },
  { date: new Date(Date.now() + 86400000 * 3), high: 68, low: 52, condition: 'RAINY', precipProbability: 70, sunrise: '6:29 AM', sunset: '7:18 PM' },
  { date: new Date(Date.now() + 86400000 * 4), high: 74, low: 56, condition: 'PARTLY_CLOUDY', precipProbability: 15, sunrise: '6:28 AM', sunset: '7:19 PM' },
];

const MOCK_COURSE_CONDITIONS: CourseConditions = {
  greenSpeed: 10.5,
  fairwayFirmness: 'MEDIUM',
  greenFirmness: 'FIRM',
  roughHeight: 2.5,
  bunkerCondition: 'FLUFFY',
  cartRule: '90_DEGREE',
  lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000),
  notes: [
    'Hole 7 green recently aerified',
    'Practice range mat only today',
  ],
};

const MOCK_ALERTS: WeatherAlert[] = [
  {
    id: 'alert-1',
    type: 'HEAT',
    severity: 'WARNING',
    title: 'Heat Advisory',
    message: 'High temperatures expected. Stay hydrated and take breaks.',
    startTime: new Date(),
    endTime: new Date(Date.now() + 6 * 60 * 60 * 1000),
    isActive: true,
  },
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
};

const formatDay = (date: Date): string => {
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return 'Today';
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

const calculatePlayability = (weather: CurrentWeather): PlayabilityRating => {
  let score = 100;

  // Temperature penalties
  if (weather.temperature < 50) score -= 20;
  else if (weather.temperature < 60) score -= 10;
  else if (weather.temperature > 95) score -= 25;
  else if (weather.temperature > 85) score -= 10;

  // Wind penalties
  if (weather.windSpeed > 25) score -= 30;
  else if (weather.windSpeed > 18) score -= 20;
  else if (weather.windSpeed > 12) score -= 10;

  // Condition penalties
  if (weather.condition === 'STORMY') score -= 50;
  if (weather.condition === 'RAINY') score -= 25;
  if (weather.condition === 'FOGGY') score -= 15;

  // Humidity penalties
  if (weather.humidity > 80) score -= 10;

  if (score >= 85) return 'EXCELLENT';
  if (score >= 70) return 'GOOD';
  if (score >= 50) return 'FAIR';
  if (score >= 25) return 'POOR';
  return 'UNPLAYABLE';
};

const calculateDistanceAdjustments = (weather: CurrentWeather, altitude: number = 0): DistanceAdjustment[] => {
  const adjustments: DistanceAdjustment[] = [];

  // Temperature adjustment
  const tempDiff = weather.temperature - 70;
  if (Math.abs(tempDiff) >= 10) {
    const tempAdj = Math.round(tempDiff * 0.2);
    adjustments.push({
      factor: 'Temperature',
      adjustment: tempAdj,
      description: `${weather.temperature}°F (${tempAdj > 0 ? '+' : ''}${tempAdj}%)`,
    });
  }

  // Altitude adjustment
  if (altitude > 1000) {
    const altAdj = Math.round((altitude / 1000) * 2);
    adjustments.push({
      factor: 'Altitude',
      adjustment: altAdj,
      description: `${altitude.toLocaleString()}ft (+${altAdj}%)`,
    });
  }

  // Humidity adjustment
  if (weather.humidity > 70) {
    adjustments.push({
      factor: 'Humidity',
      adjustment: -1,
      description: `${weather.humidity}% humidity (-1%)`,
    });
  }

  // Wind adjustment (simplified - actual would depend on shot direction)
  if (weather.windSpeed > 10) {
    adjustments.push({
      factor: 'Wind',
      adjustment: 0,
      description: `${weather.windSpeed}mph ${weather.windDirection} (varies)`,
    });
  }

  return adjustments;
};

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * CurrentConditionsCard - Main weather display
 */
interface CurrentConditionsCardProps {
  weather: CurrentWeather;
  location: string;
}

const CurrentConditionsCard: React.FC<CurrentConditionsCardProps> = ({ weather, location }) => {
  const playability = calculatePlayability(weather);
  const playabilityConfig = PLAYABILITY_CONFIG[playability];

  return (
    <div style={{
      background: `linear-gradient(135deg, ${COLORS.sky} 0%, ${COLORS.info} 100%)`,
      borderRadius: 20,
      padding: 24,
      color: COLORS.white,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    }}>
      {/* Location & Update */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
      }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{location}</div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>
            Updated {formatTime(weather.updatedAt)}
          </div>
        </div>
        <div style={{
          padding: '6px 12px',
          backgroundColor: playabilityConfig.color,
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 600,
        }}>
          {playabilityConfig.label} Golf
        </div>
      </div>

      {/* Main Temperature */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        marginBottom: 20,
      }}>
        <span style={{ fontSize: 64 }}>{WEATHER_ICONS[weather.condition]}</span>
        <div>
          <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1 }}>
            {Math.round(weather.temperature)}°
          </div>
          <div style={{ fontSize: 14, opacity: 0.9 }}>
            Feels like {Math.round(weather.feelsLike)}°
          </div>
        </div>
      </div>

      {/* Key Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 12,
        padding: 16,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 12,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 600 }}>{weather.windSpeed}</div>
          <div style={{ fontSize: 10, opacity: 0.8 }}>mph {weather.windDirection}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 600 }}>{weather.humidity}%</div>
          <div style={{ fontSize: 10, opacity: 0.8 }}>Humidity</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 600 }}>{weather.uvIndex}</div>
          <div style={{ fontSize: 10, opacity: 0.8 }}>UV Index</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 600 }}>{weather.precipitation}%</div>
          <div style={{ fontSize: 10, opacity: 0.8 }}>Rain</div>
        </div>
      </div>
    </div>
  );
};

/**
 * WindCompass - Visual wind direction display
 */
interface WindCompassProps {
  direction: WindDirection;
  speed: number;
  gust?: number;
}

const WindCompass: React.FC<WindCompassProps> = ({ direction, speed, gust }) => {
  const rotation = WIND_DIRECTION_DEGREES[direction];

  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 16,
      padding: 20,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Wind</h3>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 20,
      }}>
        {/* Compass */}
        <div style={{
          position: 'relative',
          width: 100,
          height: 100,
        }}>
          {/* Compass ring */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            border: `3px solid ${COLORS.gray[200]}`,
            borderRadius: '50%',
          }} />

          {/* Direction markers */}
          {['N', 'E', 'S', 'W'].map((dir, i) => (
            <div
              key={dir}
              style={{
                position: 'absolute',
                top: i === 0 ? 4 : i === 2 ? 'auto' : '50%',
                bottom: i === 2 ? 4 : 'auto',
                left: i === 3 ? 4 : i === 1 ? 'auto' : '50%',
                right: i === 1 ? 4 : 'auto',
                transform: i === 0 || i === 2 ? 'translateX(-50%)' : 'translateY(-50%)',
                fontSize: 10,
                fontWeight: 600,
                color: COLORS.gray[400],
              }}
            >
              {dir}
            </div>
          ))}

          {/* Arrow */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 40,
            height: 40,
            transform: `translate(-50%, -50%) rotate(${rotation + 180}deg)`,
            transition: 'transform 0.5s ease',
          }}>
            <div style={{
              width: 0,
              height: 0,
              borderLeft: '10px solid transparent',
              borderRight: '10px solid transparent',
              borderBottom: `30px solid ${COLORS.primary}`,
              marginLeft: 10,
            }} />
          </div>

          {/* Center dot */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 10,
            height: 10,
            backgroundColor: COLORS.gray[400],
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
          }} />
        </div>

        {/* Wind Stats */}
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: COLORS.gray[500] }}>Direction</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{direction}</div>
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            <div>
              <div style={{ fontSize: 12, color: COLORS.gray[500] }}>Speed</div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>{speed} mph</div>
            </div>
            {gust && (
              <div>
                <div style={{ fontSize: 12, color: COLORS.gray[500] }}>Gusts</div>
                <div style={{ fontSize: 18, fontWeight: 600, color: COLORS.warning }}>{gust} mph</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * HourlyForecastRow - 12-hour outlook
 */
interface HourlyForecastRowProps {
  forecast: HourlyForecast[];
}

const HourlyForecastRow: React.FC<HourlyForecastRowProps> = ({ forecast }) => {
  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 16,
      padding: 16,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Hourly Forecast</h3>

      <div style={{
        display: 'flex',
        gap: 12,
        overflowX: 'auto',
        paddingBottom: 8,
      }}>
        {forecast.map((hour, index) => (
          <div
            key={index}
            style={{
              minWidth: 60,
              textAlign: 'center',
              padding: 8,
              backgroundColor: index === 0 ? `${COLORS.primary}10` : 'transparent',
              borderRadius: 12,
            }}
          >
            <div style={{ fontSize: 12, color: COLORS.gray[500] }}>
              {index === 0 ? 'Now' : formatTime(hour.hour)}
            </div>
            <div style={{ fontSize: 24, margin: '8px 0' }}>
              {WEATHER_ICONS[hour.condition]}
            </div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>
              {Math.round(hour.temperature)}°
            </div>
            {hour.precipProbability > 10 && (
              <div style={{
                fontSize: 10,
                color: COLORS.info,
                marginTop: 4,
              }}>
                💧 {hour.precipProbability}%
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * DailyForecastCard - 5-day outlook
 */
interface DailyForecastCardProps {
  forecast: DailyForecast[];
}

const DailyForecastCard: React.FC<DailyForecastCardProps> = ({ forecast }) => {
  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 16,
      padding: 16,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>5-Day Forecast</h3>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {forecast.map((day, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: 12,
              borderBottom: index < forecast.length - 1 ? `1px solid ${COLORS.gray[100]}` : 'none',
            }}
          >
            <div style={{ width: 70, fontSize: 14, fontWeight: 500 }}>
              {formatDay(day.date)}
            </div>
            <div style={{ width: 40, textAlign: 'center', fontSize: 24 }}>
              {WEATHER_ICONS[day.condition]}
            </div>
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '0 12px',
            }}>
              <span style={{ fontSize: 14, color: COLORS.gray[400] }}>{day.low}°</span>
              <div style={{
                flex: 1,
                height: 4,
                backgroundColor: COLORS.gray[200],
                borderRadius: 2,
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute',
                  left: `${((day.low - 40) / 60) * 100}%`,
                  right: `${100 - ((day.high - 40) / 60) * 100}%`,
                  top: 0,
                  bottom: 0,
                  backgroundColor: COLORS.primary,
                  borderRadius: 2,
                }} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{day.high}°</span>
            </div>
            <div style={{
              width: 40,
              textAlign: 'right',
              fontSize: 12,
              color: COLORS.info,
            }}>
              {day.precipProbability > 0 ? `${day.precipProbability}%` : ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * PlayabilityScore - Overall golf conditions rating
 */
interface PlayabilityScoreProps {
  weather: CurrentWeather;
  conditions?: CourseConditions;
}

const PlayabilityScore: React.FC<PlayabilityScoreProps> = ({ weather, conditions }) => {
  const playability = calculatePlayability(weather);
  const config = PLAYABILITY_CONFIG[playability];

  const factors = [
    { name: 'Temperature', value: weather.temperature, unit: '°F', good: weather.temperature >= 60 && weather.temperature <= 85 },
    { name: 'Wind', value: weather.windSpeed, unit: ' mph', good: weather.windSpeed <= 15 },
    { name: 'Humidity', value: weather.humidity, unit: '%', good: weather.humidity <= 70 },
    { name: 'UV Index', value: weather.uvIndex, unit: '', good: weather.uvIndex <= 6 },
  ];

  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 16,
      padding: 20,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        marginBottom: 16,
      }}>
        <div style={{
          width: 70,
          height: 70,
          borderRadius: '50%',
          backgroundColor: `${config.color}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{ fontSize: 32 }}>⛳</span>
        </div>
        <div>
          <div style={{ fontSize: 12, color: COLORS.gray[500] }}>Playing Conditions</div>
          <div style={{
            fontSize: 24,
            fontWeight: 700,
            color: config.color,
          }}>
            {config.label}
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 8,
      }}>
        {factors.map(factor => (
          <div
            key={factor.name}
            style={{
              padding: 10,
              backgroundColor: factor.good ? `${COLORS.success}10` : `${COLORS.warning}10`,
              borderRadius: 8,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 12, color: COLORS.gray[600] }}>{factor.name}</span>
            <span style={{
              fontSize: 13,
              fontWeight: 600,
              color: factor.good ? COLORS.success : COLORS.warning,
            }}>
              {factor.value}{factor.unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * CourseConditionsCard - Green speed, firmness, etc.
 */
interface CourseConditionsCardProps {
  conditions: CourseConditions;
  courseName: string;
}

const CourseConditionsCard: React.FC<CourseConditionsCardProps> = ({ conditions, courseName }) => {
  const cartRuleLabels = {
    PATH_ONLY: '🛒 Cart Path Only',
    FAIRWAY_OK: '✅ Fairways Open',
    '90_DEGREE': '↪️ 90 Degree Rule',
    CLOSED: '❌ Carts Closed',
  };

  const firmnessColors = {
    SOFT: COLORS.info,
    MEDIUM: COLORS.success,
    FIRM: COLORS.warning,
  };

  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 16,
      padding: 16,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
      }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Course Conditions</h3>
          <div style={{ fontSize: 12, color: COLORS.gray[500] }}>{courseName}</div>
        </div>
        <span style={{
          fontSize: 11,
          color: COLORS.gray[400],
        }}>
          {Math.round((Date.now() - conditions.lastUpdated.getTime()) / (60 * 60 * 1000))}h ago
        </span>
      </div>

      {/* Green Speed */}
      <div style={{
        padding: 16,
        backgroundColor: COLORS.secondary,
        borderRadius: 12,
        color: COLORS.white,
        marginBottom: 12,
      }}>
        <div style={{ fontSize: 12, opacity: 0.8 }}>Green Speed (Stimpmeter)</div>
        <div style={{ fontSize: 32, fontWeight: 700 }}>{conditions.greenSpeed}</div>
        <div style={{ fontSize: 12, opacity: 0.8 }}>
          {conditions.greenSpeed >= 11 ? 'Fast' : conditions.greenSpeed >= 9 ? 'Medium' : 'Slow'}
        </div>
      </div>

      {/* Conditions Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 10,
        marginBottom: 12,
      }}>
        <div style={{
          padding: 12,
          backgroundColor: COLORS.gray[50],
          borderRadius: 8,
        }}>
          <div style={{ fontSize: 11, color: COLORS.gray[500] }}>Fairway</div>
          <div style={{
            fontSize: 14,
            fontWeight: 600,
            color: firmnessColors[conditions.fairwayFirmness],
          }}>
            {conditions.fairwayFirmness}
          </div>
        </div>
        <div style={{
          padding: 12,
          backgroundColor: COLORS.gray[50],
          borderRadius: 8,
        }}>
          <div style={{ fontSize: 11, color: COLORS.gray[500] }}>Greens</div>
          <div style={{
            fontSize: 14,
            fontWeight: 600,
            color: firmnessColors[conditions.greenFirmness],
          }}>
            {conditions.greenFirmness}
          </div>
        </div>
        <div style={{
          padding: 12,
          backgroundColor: COLORS.gray[50],
          borderRadius: 8,
        }}>
          <div style={{ fontSize: 11, color: COLORS.gray[500] }}>Rough Height</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{conditions.roughHeight}"</div>
        </div>
        <div style={{
          padding: 12,
          backgroundColor: COLORS.gray[50],
          borderRadius: 8,
        }}>
          <div style={{ fontSize: 11, color: COLORS.gray[500] }}>Bunkers</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{conditions.bunkerCondition}</div>
        </div>
      </div>

      {/* Cart Rule */}
      <div style={{
        padding: 12,
        backgroundColor: `${COLORS.info}10`,
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 500,
        color: COLORS.info,
      }}>
        {cartRuleLabels[conditions.cartRule]}
      </div>

      {/* Notes */}
      {conditions.notes.length > 0 && (
        <div style={{ marginTop: 12 }}>
          {conditions.notes.map((note, index) => (
            <div
              key={index}
              style={{
                padding: 8,
                backgroundColor: `${COLORS.warning}10`,
                borderRadius: 6,
                fontSize: 12,
                color: COLORS.gray[700],
                marginTop: 6,
              }}
            >
              ⚠️ {note}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * WeatherAlertBanner - Safety alerts
 */
interface WeatherAlertBannerProps {
  alert: WeatherAlert;
  onDismiss?: () => void;
}

const WeatherAlertBanner: React.FC<WeatherAlertBannerProps> = ({ alert, onDismiss }) => {
  const severityColors = {
    INFO: COLORS.info,
    WARNING: COLORS.warning,
    SEVERE: COLORS.error,
  };

  const alertIcons = {
    LIGHTNING: '⚡',
    HEAT: '🌡️',
    WIND: '💨',
    RAIN: '🌧️',
    FOG: '🌫️',
  };

  return (
    <div style={{
      backgroundColor: `${severityColors[alert.severity]}15`,
      borderRadius: 12,
      padding: 14,
      borderLeft: `4px solid ${severityColors[alert.severity]}`,
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <span style={{ fontSize: 24 }}>{alertIcons[alert.type]}</span>
          <div>
            <div style={{
              fontSize: 14,
              fontWeight: 700,
              color: severityColors[alert.severity],
            }}>
              {alert.title}
            </div>
            <p style={{
              fontSize: 13,
              color: COLORS.gray[600],
              marginTop: 4,
            }}>
              {alert.message}
            </p>
            {alert.endTime && (
              <div style={{
                fontSize: 11,
                color: COLORS.gray[500],
                marginTop: 6,
              }}>
                Until {formatTime(alert.endTime)}
              </div>
            )}
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            style={{
              padding: 4,
              backgroundColor: 'transparent',
              border: 'none',
              color: COLORS.gray[400],
              cursor: 'pointer',
              fontSize: 18,
            }}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * DistanceAdjustmentCard - Weather-based club selection
 */
interface DistanceAdjustmentCardProps {
  weather: CurrentWeather;
  altitude?: number;
  baseDistance?: number;
}

const DistanceAdjustmentCard: React.FC<DistanceAdjustmentCardProps> = ({
  weather,
  altitude = 1200,
  baseDistance = 150,
}) => {
  const adjustments = calculateDistanceAdjustments(weather, altitude);
  const totalAdjustment = adjustments.reduce((sum, adj) => sum + adj.adjustment, 0);
  const adjustedDistance = Math.round(baseDistance * (1 + totalAdjustment / 100));

  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 16,
      padding: 16,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Distance Adjustments</h3>

      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        marginBottom: 16,
        padding: 16,
        backgroundColor: COLORS.gray[50],
        borderRadius: 12,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: COLORS.gray[500] }}>Actual</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{baseDistance}y</div>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          color: COLORS.gray[400],
        }}>
          →
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: COLORS.gray[500] }}>Plays Like</div>
          <div style={{
            fontSize: 24,
            fontWeight: 700,
            color: COLORS.primary,
          }}>
            {adjustedDistance}y
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {adjustments.map((adj, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 10,
              backgroundColor: COLORS.gray[50],
              borderRadius: 8,
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{adj.factor}</div>
              <div style={{ fontSize: 11, color: COLORS.gray[500] }}>{adj.description}</div>
            </div>
            <span style={{
              fontSize: 14,
              fontWeight: 600,
              color: adj.adjustment > 0 ? COLORS.success : adj.adjustment < 0 ? COLORS.error : COLORS.gray[500],
            }}>
              {adj.adjustment > 0 ? '+' : ''}{adj.adjustment}%
            </span>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 12,
        padding: 10,
        backgroundColor: `${COLORS.primary}10`,
        borderRadius: 8,
        textAlign: 'center',
      }}>
        <span style={{ fontSize: 13, color: COLORS.gray[700] }}>
          Total Adjustment:{' '}
          <span style={{
            fontWeight: 700,
            color: totalAdjustment > 0 ? COLORS.success : COLORS.error,
          }}>
            {totalAdjustment > 0 ? '+' : ''}{totalAdjustment}%
          </span>
        </span>
      </div>
    </div>
  );
};

/**
 * BestTimeToPlay - Optimal tee time suggestion
 */
interface BestTimeToPlayProps {
  forecast: HourlyForecast[];
}

const BestTimeToPlay: React.FC<BestTimeToPlayProps> = ({ forecast }) => {
  // Find best conditions
  const scoredHours = forecast.map((hour, index) => {
    let score = 100;
    if (hour.temperature < 60 || hour.temperature > 90) score -= 20;
    if (hour.windSpeed > 15) score -= 25;
    if (hour.precipProbability > 30) score -= 30;
    return { ...hour, score, index };
  });

  const bestHours = scoredHours
    .filter(h => h.score >= 70)
    .slice(0, 3);

  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 16,
      padding: 16,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Best Time to Play</h3>

      {bestHours.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {bestHours.map((hour, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: 12,
                backgroundColor: index === 0 ? `${COLORS.success}10` : COLORS.gray[50],
                borderRadius: 10,
                border: index === 0 ? `2px solid ${COLORS.success}` : 'none',
              }}
            >
              {index === 0 && (
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '2px 8px',
                  backgroundColor: COLORS.success,
                  color: COLORS.white,
                  borderRadius: 10,
                  marginRight: 10,
                }}>
                  BEST
                </span>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>
                  {formatTime(hour.hour)}
                </div>
                <div style={{ fontSize: 12, color: COLORS.gray[500] }}>
                  {Math.round(hour.temperature)}° • {hour.windSpeed} mph wind
                </div>
              </div>
              <span style={{ fontSize: 24 }}>{WEATHER_ICONS[hour.condition]}</span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          padding: 20,
          textAlign: 'center',
          color: COLORS.gray[500],
        }}>
          No ideal playing windows in the next 12 hours
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN HUB VIEW
// ============================================================================

type WeatherTabView = 'CONDITIONS' | 'FORECAST' | 'ADJUSTMENTS';

const WeatherHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<WeatherTabView>('CONDITIONS');
  const [weather] = useState<CurrentWeather>(MOCK_CURRENT_WEATHER);
  const [hourlyForecast] = useState<HourlyForecast[]>(MOCK_HOURLY_FORECAST);
  const [dailyForecast] = useState<DailyForecast[]>(MOCK_DAILY_FORECAST);
  const [courseConditions] = useState<CourseConditions>(MOCK_COURSE_CONDITIONS);
  const [alerts, setAlerts] = useState<WeatherAlert[]>(MOCK_ALERTS);

  const tabs = [
    { id: 'CONDITIONS' as WeatherTabView, label: 'Now', icon: '🌤️' },
    { id: 'FORECAST' as WeatherTabView, label: 'Forecast', icon: '📅' },
    { id: 'ADJUSTMENTS' as WeatherTabView, label: 'Adjust', icon: '📏' },
  ];

  const dismissAlert = (alertId: string) => {
    setAlerts(alerts.filter(a => a.id !== alertId));
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: COLORS.background,
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: COLORS.white,
        padding: 16,
        borderBottom: `1px solid ${COLORS.gray[200]}`,
      }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>
          Weather & Conditions
        </h1>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: 4,
          backgroundColor: COLORS.gray[100],
          padding: 4,
          borderRadius: 10,
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '8px 4px',
                borderRadius: 8,
                border: 'none',
                backgroundColor: activeTab === tab.id ? COLORS.white : 'transparent',
                color: activeTab === tab.id ? COLORS.primary : COLORS.gray[500],
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <span style={{ display: 'block', fontSize: 16 }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div style={{ padding: '16px 16px 0' }}>
          {alerts.map(alert => (
            <WeatherAlertBanner
              key={alert.id}
              alert={alert}
              onDismiss={() => dismissAlert(alert.id)}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div style={{ padding: 16 }}>
        {activeTab === 'CONDITIONS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <CurrentConditionsCard weather={weather} location="TPC Scottsdale" />
            <PlayabilityScore weather={weather} />
            <WindCompass
              direction={weather.windDirection}
              speed={weather.windSpeed}
              gust={weather.windGust}
            />
            <CourseConditionsCard
              conditions={courseConditions}
              courseName="TPC Scottsdale"
            />
          </div>
        )}

        {activeTab === 'FORECAST' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <HourlyForecastRow forecast={hourlyForecast} />
            <BestTimeToPlay forecast={hourlyForecast} />
            <DailyForecastCard forecast={dailyForecast} />
          </div>
        )}

        {activeTab === 'ADJUSTMENTS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <DistanceAdjustmentCard
              weather={weather}
              altitude={1200}
              baseDistance={150}
            />

            <div style={{
              backgroundColor: COLORS.white,
              borderRadius: 16,
              padding: 16,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Quick Reference</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { club: '7 Iron', normal: 155, adjusted: 162 },
                  { club: '8 Iron', normal: 143, adjusted: 150 },
                  { club: 'PW', normal: 125, adjusted: 131 },
                ].map(row => (
                  <div
                    key={row.club}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 10,
                      backgroundColor: COLORS.gray[50],
                      borderRadius: 8,
                    }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{row.club}</span>
                    <div>
                      <span style={{ fontSize: 12, color: COLORS.gray[500] }}>{row.normal}y → </span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.primary }}>
                        {row.adjusted}y
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export {
  WeatherHub,
  CurrentConditionsCard,
  WindCompass,
  HourlyForecastRow,
  DailyForecastCard,
  PlayabilityScore,
  CourseConditionsCard,
  WeatherAlertBanner,
  DistanceAdjustmentCard,
  BestTimeToPlay,
  calculatePlayability,
  calculateDistanceAdjustments,
  type CurrentWeather,
  type HourlyForecast,
  type DailyForecast,
  type CourseConditions,
  type WeatherAlert,
  type WeatherCondition,
  type WindDirection,
  type PlayabilityRating,
};

export default WeatherHub;
