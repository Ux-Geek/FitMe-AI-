export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  category: string;
  colors: string[];
  sizes: string[];
  description: string;
}

export interface Look {
  id: string;
  userId: string;
  productId: string;
  userImage: string;
  resultImage: string;
  createdAt: number;
}

// Virtual Try-On Flow Types
export type FlowState =
  | 'idle'
  | 'picking_front_image'
  | 'picking_side_image'
  | 'selecting_outfit'
  | 'reviewing'
  | 'uploading'
  | 'processing'
  | 'completed'
  | 'failed';

export interface UploadedImage {
  uri: string;
  file: File;
  width?: number;
  height?: number;
  type?: string;
}

export interface TryOnResult {
  jobId: string;
  status: FlowState;
  outputUrl?: string;
  error?: string;
  progress?: number;
}

export interface TryOnJob {
  jobId: string;
  status: 'processing' | 'completed' | 'failed';
  outputUrl?: string;
  error?: string;
  createdAt: string;
}
