export interface WeatherData {
  date: string;
  minTemp: number;
  maxTemp: number;
}

export interface WindyData extends WeatherData {
  Win_Date: string;
  Win_Min: number;
  Win_Max: number;
  Win_Current: number;
  name?: string;        // Optional property for the chart
  average?: number; // Optional property for the chart
}

export interface METMalaysiaData extends WeatherData {
  Met_Date: string;
  Met_Min: number;
  Met_Max: number;
  name?: string;
  average?: number;
}

export interface OpenWeatherMapData extends WeatherData {
  OWM_Date: string;
  OWM_Min: number;
  OWM_Max: number;
  OWM_Current: number;
  name?: string;
  average?: number;
}