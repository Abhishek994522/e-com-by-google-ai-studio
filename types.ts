
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  rating: number;
  tags: string[];
}

export interface CartItem extends Product {
  quantity: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export enum AspectRatio {
  SQUARE = '1:1',
  PORTRAIT_2_3 = '2:3',
  LANDSCAPE_3_2 = '3:2',
  PORTRAIT_3_4 = '3:4',
  LANDSCAPE_4_3 = '4:3',
  PORTRAIT_9_16 = '9:16',
  LANDSCAPE_16_9 = '16:9',
  ULTRAWIDE = '21:9'
}
