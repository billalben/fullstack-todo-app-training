import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (dateString: string) => {
  // const [datePart, timePart] = dateString.split("T");
  const [datePart] = dateString.split("T");
  return datePart;
};

export const formatTime = (dateString: string) => {
  const timePart = dateString.split("T")[1];
  // const [time, _] = timePart.split(".");
  const [time] = timePart.split(".");
  return time;
};
