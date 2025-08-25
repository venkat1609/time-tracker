import type { ValidationResult } from "./types";

export function formatTimeHMS(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return (
    hours.toString().padStart(2, "0") +
    ":" +
    minutes.toString().padStart(2, "0") +
    ":" +
    seconds.toString().padStart(2, "0")
  );
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}

export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function formatDateTimeForInput(isoString: string): string {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hour = date.getHours().toString().padStart(2, "0");
  const minute = date.getMinutes().toString().padStart(2, "0");
  const second = date.getSeconds().toString().padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
}

export function parseInputDateTime(val: string): Date {
  if (val.length === 16) val += ":00";
  return new Date(val);
}

export function validateTimeRange(
  start: Date,
  end: Date,
  originalDuration: number
): ValidationResult {
  const newDuration = Math.round((end.getTime() - start.getTime()) / 1000);

  if (newDuration <= 0) {
    return {
      valid: false,
      message: "End time must be after start time",
      duration: 0,
    };
  }

  if (originalDuration < 60) {
    return { valid: true, duration: newDuration };
  }

  const diff = Math.abs(newDuration - originalDuration);
  const maxDiff = Math.max(originalDuration * 0.5, 300);

  if (diff > maxDiff) {
    return {
      valid: false,
      message: `Duration change too large (${Math.round(diff / 60)}min).`,
      duration: newDuration,
    };
  }

  return { valid: true, duration: newDuration };
}
