export type Theme = "dark" | "light";

const storageKey = "animemo-theme";
const changeEvent = "animemo:theme-change";

export const themeInitializationScript = `(() => {
  let theme = "dark";
  try {
    if (localStorage.getItem("${storageKey}") === "light") theme = "light";
  } catch {}
  document.documentElement.dataset.theme = theme;
})();`;

export function getTheme(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

export function getServerTheme(): Theme {
  return "dark";
}

export function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    window.localStorage.setItem(storageKey, theme);
  } catch {
    // The current tab can still switch themes when storage is unavailable.
  }
  window.dispatchEvent(new Event(changeEvent));
}

export function subscribeToTheme(onChange: () => void) {
  function onStorage(event: StorageEvent) {
    if (event.key !== storageKey && event.key !== null) return;
    document.documentElement.dataset.theme = event.newValue === "light" ? "light" : "dark";
    onChange();
  }

  window.addEventListener(changeEvent, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(changeEvent, onChange);
    window.removeEventListener("storage", onStorage);
  };
}
