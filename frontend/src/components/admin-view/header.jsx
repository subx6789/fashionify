import { AlignJustify, Store, Sun, Moon } from "lucide-react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/components/theme-provider";

function AdminHeader({ setOpen }) {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-card border-b border-border sticky top-0 z-40">
      <Button variant="outline" size="icon" onClick={() => setOpen(true)} className="lg:hidden sm:flex">
        <AlignJustify className="h-5 w-5" />
        <span className="sr-only">Toggle Menu</span>
      </Button>
      <div className="flex flex-1 justify-end gap-4 items-center">
        {/* Theme toggle — wired to ThemeProvider, persists to localStorage */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate("/shop/home")}
          className="gap-2 font-medium"
        >
          <Store className="h-4 w-4" />
          View Store
        </Button>
      </div>
    </header>
  );
}

export default AdminHeader;
