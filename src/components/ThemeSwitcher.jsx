import React from "react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeSwitcher() {
const { theme, changeTheme } = useTheme();

return ( <div className="theme-switcher"> <label htmlFor="foodbridge-theme">🎨 Theme</label>

```
  <select
    id="foodbridge-theme"
    value={theme}
    onChange={(event) => changeTheme(event.target.value)}
  >
    <option value="nature">🌿 Nature Green</option>
    <option value="sunset">🌅 Sunset Orange</option>
    <option value="midnight">🌙 Midnight Dark</option>
  </select>
</div>


);
}
