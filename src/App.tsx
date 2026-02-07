import { HomePage } from "@/components/home-page";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./App.css";
import { ShortcutsProvider } from "./shared-lib/shortcuts/shortcuts-provider";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <ShortcutsProvider>
        <HomePage />
        <Toaster />
      </ShortcutsProvider>
    </ThemeProvider>
  );
}

export default App;
