"use client";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { updateproductDetails } from "@/redux/features/product-details";
import type { Product } from "@/types/product";

export default function HydrateProduct({ item }: { item: Product }) {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (!item) return;
    try {
      dispatch(updateproductDetails({ ...item } as any));
      if (typeof window !== "undefined") {
        localStorage.setItem("productDetails", JSON.stringify(item));
      }
    } catch (e) {
      // noop
    }
  }, [dispatch, item]);

  return null;
}
