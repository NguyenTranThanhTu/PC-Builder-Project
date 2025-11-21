import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

type InitialState = {
  items: CartItem[];
};

type CartItem = {
  id: string;
  // Optional: DB product id to enable checkout API mapping
  productId?: string;
  title: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};

function loadCartFromStorage(): CartItem[] {
  if (typeof window !== 'undefined') {
    try {
      const data = localStorage.getItem('cartItems');
      if (data) return JSON.parse(data);
    } catch {}
  }
  return [];
}

const initialState: InitialState = {
  items: typeof window !== 'undefined' ? loadCartFromStorage() : [],
};

export const cart = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItemToCart: (state, action: PayloadAction<CartItem>) => {
      const { id, title, price, quantity, discountedPrice, imgs, productId } =
        action.payload;
      const existingItem = state.items.find((item) => item.id === id);

      if (existingItem) {
        existingItem.quantity += quantity;
        if (productId && !existingItem.productId) {
          existingItem.productId = productId;
        }
      } else {
        state.items.push({
          id,
          title,
          price,
          quantity,
          discountedPrice,
          imgs,
          productId,
        });
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('cartItems', JSON.stringify(state.items));
      }
    },
    removeItemFromCart: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.items = state.items.filter((item) => item.id !== id);
      if (typeof window !== 'undefined') {
        localStorage.setItem('cartItems', JSON.stringify(state.items));
      }
    },
    updateCartItemQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) => {
      const { id, quantity } = action.payload;
      const existingItem = state.items.find((item) => item.id === id);
      if (existingItem) {
        existingItem.quantity = quantity;
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('cartItems', JSON.stringify(state.items));
      }
    },

    removeAllItemsFromCart: (state) => {
      state.items = [];
      if (typeof window !== 'undefined') {
        localStorage.setItem('cartItems', JSON.stringify(state.items));
      }
    },
  },
});

export const selectCartItems = (state: RootState) => state.cartReducer.items;

export const selectTotalPrice = createSelector([selectCartItems], (items) => {
  return items.reduce((total, item) => {
    return total + item.discountedPrice * item.quantity;
  }, 0);
});

export const {
  addItemToCart,
  removeItemFromCart,
  updateCartItemQuantity,
  removeAllItemsFromCart,
} = cart.actions;
export default cart.reducer;
