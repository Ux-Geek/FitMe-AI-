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
