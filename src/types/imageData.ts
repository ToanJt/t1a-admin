export interface ImageData {
  name: string;
  largeURL: string;
  thumbnailURL: string;
  widthOrigin: number | null;
  heightOrigin: number | null;
  description: string | null;
  client: string | null;
  year: number | null;
  type: string | null;
  size: string | null;
  is360: boolean;
  link360: string | null;
}
