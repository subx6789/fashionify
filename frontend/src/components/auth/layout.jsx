import { Outlet } from "react-router-dom";

function AuthLayout() {
  return (
    <div className="flex min-h-screen w-full">
      <div className="hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-primary to-primary-dark w-1/2 px-12 relative overflow-hidden">
        {/* Decorative lighting inside Auth Sidebar */}
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
        
        <div className="max-w-md space-y-6 text-center text-white relative z-10">
          <h1 className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-primary to-primary-dark leading-tight">
            Discover the Future of Style
          </h1>
          <p className="text-primary-soft/70 text-lg">
            Immerse yourself in a curated shopping experience tailored perfectly to your lifestyle.
          </p>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <Outlet />
      </div>
    </div>
  );
}

export default AuthLayout;
