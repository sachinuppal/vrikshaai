import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function maskPhoneNumber(phone: string): string {
  if (!phone) return "";
  
  // Extract prefix (country code like +91, IN, etc.) and digits
  const match = phone.match(/^([A-Z+]+)?(\d+)$/i);
  
  if (!match) return phone;
  
  const prefix = match[1] || "";
  const digits = match[2] || "";
  
  if (digits.length <= 4) return phone;
  
  // Show last 4 digits, mask the rest
  const maskedDigits = "••••" + digits.slice(-4);
  
  return prefix + maskedDigits;
}
