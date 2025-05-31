import { useTheme } from "./context/ThemeContext";
import AccountManagement from './components/AccountManagement';

function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="container">
      <button 
        className="theme-toggle" 
        onClick={toggleTheme}
        data-theme={theme}
        aria-label="Toggle theme"
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
      
      <AccountManagement />
    </div>
  );
}

export default App;