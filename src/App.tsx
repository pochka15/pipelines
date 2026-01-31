import { HomePage } from "@/components/home-page";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { NuphyProvider } from "@/lib/nuphy/nuphy-provider";
import "./App.css";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <NuphyProvider>
        <HomePage />
        <Toaster />
      </NuphyProvider>
    </ThemeProvider>
  );
}

export default App;
