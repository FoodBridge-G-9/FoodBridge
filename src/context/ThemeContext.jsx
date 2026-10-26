import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
const [theme, setTheme] = useState(() => {
return localStorage.getItem("foodbridge-theme") || "nature";
});

useEffect(() => {
const root = document.documentElement;


if (theme === "nature") {
  // Restore the original website theme preference.
  const savedMode = localStorage.getItem("foodbridge-mode") || "dark";
  root.setAttribute("data-theme", savedMode);
} else {
  root.setAttribute("data-theme", theme);
}

localStorage.setItem("foodbridge-theme", theme);


}, [theme]);

const changeTheme = (newTheme) => {
setTheme(newTheme);
};

return (
<ThemeContext.Provider value={{ theme, changeTheme }}>
{children}
</ThemeContext.Provider>
);
}

export function useTheme() {
const context = useContext(ThemeContext);

if (!context) {
throw new Error("useTheme must be used inside ThemeProvider");
}

return context;
}
