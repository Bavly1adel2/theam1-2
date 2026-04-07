(() => {
  try {
    const mode = localStorage.getItem("neuroai-theme") || "system";
    const resolved =
      mode === "dark" || mode === "light"
        ? mode
        : window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    if (resolved === "dark") document.documentElement.classList.add("dark");
    document.documentElement.dataset.theme = resolved;
  } catch {
    document.documentElement.classList.add("dark");
    document.documentElement.dataset.theme = "dark";
  }
})();

