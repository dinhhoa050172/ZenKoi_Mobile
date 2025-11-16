/**
 * Types cho Water Alert System
 */

export enum ParameterName {
  PHLevel = 'PHLevel',
  TemperatureCelsius = 'TemperatureCelsius',
  OxygenLevel = 'OxygenLevel',
  AmmoniaLevel = 'AmmoniaLevel',
  NitriteLevel = 'NitriteLevel',
  NitrateLevel = 'NitrateLevel',
  CarbonHardness = 'CarbonHardness',
  WaterLevelMeters = 'WaterLevelMeters',
}

export enum AlertType {
  High = 'High',
  Low = 'Low',
  RapidChange = 'RapidChange',
}

export enum SeverityLevel {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Urgent = 'Urgent',
}

export interface WaterAlert {
  Id: number;
  PondId: number;
  PondName: string | null;
  ParameterName: ParameterName;
  MeasuredValue: number;
  AlertType: AlertType;
  Severity: SeverityLevel;
  Message: string;
  CreatedAt: string;
  IsResolved: boolean;
  ResolvedByUserId: number | null;
  ResolvedByUserName: string | null;
}

/**
 * Helper functions để convert enum sang tiếng Việt
 */
export const ParameterNameLabels: Record<ParameterName, string> = {
  [ParameterName.PHLevel]: 'Độ pH',
  [ParameterName.TemperatureCelsius]: 'Nhiệt độ',
  [ParameterName.OxygenLevel]: 'Hàm lượng Oxy',
  [ParameterName.AmmoniaLevel]: 'Nồng độ Amoniac',
  [ParameterName.NitriteLevel]: 'Nồng độ Nitrit',
  [ParameterName.NitrateLevel]: 'Nồng độ Nitrat',
  [ParameterName.CarbonHardness]: 'Độ cứng Cacbonat',
  [ParameterName.WaterLevelMeters]: 'Mực nước',
};

export const AlertTypeLabels: Record<AlertType, string> = {
  [AlertType.High]: 'Vượt ngưỡng cao',
  [AlertType.Low]: 'Dưới ngưỡng thấp',
  [AlertType.RapidChange]: 'Thay đổi đột ngột',
};

export const SeverityLevelLabels: Record<SeverityLevel, string> = {
  [SeverityLevel.Low]: 'Thấp',
  [SeverityLevel.Medium]: 'Trung bình',
  [SeverityLevel.High]: 'Cao',
  [SeverityLevel.Urgent]: 'Khẩn cấp',
};

export const SeverityLevelColors: Record<SeverityLevel, string> = {
  [SeverityLevel.Low]: '#10b981',
  [SeverityLevel.Medium]: '#f59e0b',
  [SeverityLevel.High]: '#f97316',
  [SeverityLevel.Urgent]: '#ef4444',
};
