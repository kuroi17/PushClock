// ThemeManager.js - Handles theme switching (light/dark/system) for PushClock
export class ThemeManager {
  constructor() {
    this.currentTheme = this.getStoredTheme() || this.getSystemTheme();
    this.applyTheme(this.currentTheme);
    this.initializeToggle();
  }

  getSystemTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  getStoredTheme() {
    return localStorage.getItem("theme");
  }

  applyTheme(theme) {
    if (theme === "system") {
      document.documentElement.removeAttribute("data-theme");
      localStorage.removeItem("theme");
    } else {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);
    }
    this.currentTheme = theme;
    this.updateToggleUI();
  }

  initializeToggle() {
    const toggle = document.querySelector(".theme-toggle");
    if (toggle) {
      toggle.addEventListener("click", (e) => {
        if (e.target.matches(".theme-toggle-option")) {
          const newTheme = e.target.dataset.theme;
          this.applyTheme(newTheme);
        }
      });
    }
  }

  updateToggleUI() {
    const options = document.querySelectorAll(".theme-toggle-option");
    options.forEach((option) => {
      option.classList.toggle(
        "active",
        option.dataset.theme === this.currentTheme,
      );
      option.setAttribute(
        "aria-checked",
        option.dataset.theme === this.currentTheme ? "true" : "false",
      );
    });
  }
}

// Auto-initialize on DOMContentLoaded
if (typeof window !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    new ThemeManager();
  });
}
