import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(
  price: number | string,
  options: {
    currency?: "USD" | "EUR" | "GBP" | "BDT" | "IDR";
    notation?: Intl.NumberFormatOptions["notation"];
  } = {} //Default value = empty object
) {
  const { currency = "USD", notation = "compact" } = options;

  const numericPrice = typeof price === "string" ? parseFloat(price) : price;

  return new Intl.NumberFormat("en-US", {
    style: "currency", //tells Intl.NumberFormat to format the number as a currency string (e.g., $1,000.00 instead of 1000).
    currency: currency,
    notation: notation,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericPrice);
}
