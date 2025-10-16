import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary glow-cyan tracking-wider mb-2">
            Claimed System
          </h1>
          <p className="text-sm text-muted-foreground">Professional respawn coordination platform</p>
        </div>
        {children}
      </div>
    </div>
  );
};
