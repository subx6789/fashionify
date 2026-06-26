import { useNavigate } from "react-router-dom";
import { MoveLeft, Home } from "lucide-react";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 overflow-hidden relative">
      {/* Decorative background grid */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(hsl(var(--neu-black)) 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}></div>

      <div className="relative text-center max-w-lg w-full z-10">
        {/* Giant 404 */}
        <div className="relative inline-block">
          <h1 
            className="text-[10rem] md:text-[14rem] font-black leading-none text-primary tracking-tighter select-none relative z-10"
            style={{ textShadow: "8px 8px 0px hsl(var(--neu-black))" }}
          >
            404
          </h1>
          {/* Decorative shapes behind text */}
          <div className="absolute top-1/4 -left-12 w-20 h-20 bg-[hsl(var(--neu-yellow))] rounded-full border-4 border-black shadow-[4px_4px_0px_0px_hsl(var(--neu-black))] -z-10 animate-bounce" style={{ animationDuration: '3s' }} />
          <div className="absolute bottom-1/4 -right-8 w-16 h-16 bg-[hsl(var(--neu-blue))] border-4 border-black shadow-[4px_4px_0px_0px_hsl(var(--neu-black))] rotate-12 -z-10 animate-pulse" />
        </div>
        
        {/* Error message card */}
        <div className="bg-card border-4 border-black p-8 mt-4 shadow-[8px_8px_0px_0px_hsl(var(--neu-black))] relative z-20 rounded-sm hover:-translate-y-1 transition-transform duration-300">
          <h2 className="text-3xl md:text-4xl font-black mb-4 uppercase tracking-tight text-foreground">
            Lost your way?
          </h2>
          <p className="text-muted-foreground font-bold mb-8 text-base md:text-lg">
            The page you're looking for has vanished. Maybe it went out of style, or perhaps it never existed at all.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <button
              onClick={() => navigate(-1)}
              className="neu-btn bg-background text-foreground hover:bg-muted border-2 border-black w-full sm:w-auto text-sm"
            >
              <MoveLeft className="w-4 h-4 mr-1" />
              Go Back
            </button>
            <button
              onClick={() => navigate("/shop/home")}
              className="neu-btn-primary border-2 border-black w-full sm:w-auto text-sm"
            >
              <Home className="w-4 h-4 mr-1" />
              Return Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
