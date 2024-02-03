import Color from "color";

export interface InternalLinearColorStop<T = string | Color> {
  lengthPercentage: number;
  color: T;
}

export type LinearColorStop = InternalLinearColorStop<string>;

export interface InternalLinearGradient<T = string | Color> {
  angle: number;
  stopList: InternalLinearColorStop<T>[];
}

export type LinearGradient = InternalLinearGradient<string>;