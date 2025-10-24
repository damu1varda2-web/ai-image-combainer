
export interface ImageSlot {
  person: string | null;
  background: string | null;
  object: string | null;
  accessory: string | null;
}

export interface StyleOption {
  name: string;
  preview: string;
}

export type AspectRatio = '1:1' | '16:9' | '9:16';

export interface Creation {
  id: string;
  prompt: string;
  style: string;
  aspectRatio: AspectRatio;
  imageUrl: string;
  shareUrl: string;
}
