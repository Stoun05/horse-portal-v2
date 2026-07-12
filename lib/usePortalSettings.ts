"use client";

import { useEffect, useState } from "react";

export type PortalLanguage = "tk" | "ru" | "en";
export type PortalTheme = "light" | "dark" | "system";
export type RoleName = "Admin" | "Operator" | "Weterinar" | "Gözegçi";
export type PermissionName = "view" | "edit" | "delete" | "health" | "media" | "reports" | "users";

export type PortalSettings = {
  portalName: string;
  organization: string;
  adminEmail: string;
  logo: string;
  primaryColor: string;
  language: PortalLanguage;
  theme: PortalTheme;
  rowsPerPage: number;
  notifications: {
    email: boolean;
    vaccine: boolean;
    health: boolean;
    newUser: boolean;
    reminderDays: number;
  };
  permissions: Record<RoleName, Record<PermissionName, boolean>>;
};

export const SETTINGS_STORAGE_KEY = "horse-portal-settings-v1";
export const SETTINGS_EVENT = "horse-portal-settings-changed";

export const defaultSettings: PortalSettings = {
  portalName: "Atçylyk portaly",
  organization: "Atçylyk Akademiýasy",
  adminEmail: "",
  logo: "",
  primaryColor: "#0b5e3c",
  language: "tk",
  theme: "light",
  rowsPerPage: 24,
  notifications: {
    email: false,
    vaccine: true,
    health: true,
    newUser: false,
    reminderDays: 7,
  },
  permissions: {
    Admin: { view: true, edit: true, delete: true, health: true, media: true, reports: true, users: true },
    Operator: { view: true, edit: true, delete: false, health: false, media: true, reports: true, users: false },
    Weterinar: { view: true, edit: false, delete: false, health: true, media: false, reports: true, users: false },
    Gözegçi: { view: true, edit: false, delete: false, health: false, media: false, reports: false, users: false },
  },
};

function readSettings(): PortalSettings {
  if (typeof window === "undefined") return defaultSettings;
  try {
    const saved = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!saved) return defaultSettings;
    const parsed = JSON.parse(saved) as Partial<PortalSettings>;
    return {
      ...defaultSettings,
      ...parsed,
      notifications: { ...defaultSettings.notifications, ...parsed.notifications },
      permissions: {
        Admin: { ...defaultSettings.permissions.Admin, ...parsed.permissions?.Admin },
        Operator: { ...defaultSettings.permissions.Operator, ...parsed.permissions?.Operator },
        Weterinar: { ...defaultSettings.permissions.Weterinar, ...parsed.permissions?.Weterinar },
        Gözegçi: { ...defaultSettings.permissions.Gözegçi, ...parsed.permissions?.Gözegçi },
      },
    };
  } catch {
    return defaultSettings;
  }
}

export function applyPortalAppearance(settings: PortalSettings) {
  if (typeof document === "undefined") return;
  document.documentElement.style.setProperty("--portal-primary", settings.primaryColor);
  const dark =
    settings.theme === "dark" ||
    (settings.theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}

export function usePortalSettings() {
  const [settings, setSettingsState] = useState<PortalSettings>(defaultSettings);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const current = readSettings();
    setSettingsState(current);
    applyPortalAppearance(current);
    setHydrated(true);

    const refresh = () => {
      const next = readSettings();
      setSettingsState(next);
      applyPortalAppearance(next);
    };
    window.addEventListener("storage", refresh);
    window.addEventListener(SETTINGS_EVENT, refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener(SETTINGS_EVENT, refresh);
    };
  }, []);

  const saveSettings = (next: PortalSettings) => {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next));
    setSettingsState(next);
    applyPortalAppearance(next);
    window.dispatchEvent(new Event(SETTINGS_EVENT));
  };

  return { settings, saveSettings, hydrated };
}
