import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, ExternalLink, Mail, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AuthLayout } from "@/components/AuthLayout";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check if user needs onboarding
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed, first_login')
        .eq('id', data.user.id)
        .single();

      const needsOnboarding = profile?.first_login === true || profile?.onboarding_completed === false;

      toast({
        title: needsOnboarding ? "Welcome!" : "Welcome back!",
        description: needsOnboarding 
          ? "Let's set up your account" 
          : "You have successfully signed in.",
      });

      // Redirect based on onboarding status
      navigate(needsOnboarding ? "/onboarding" : "/dashboard");
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!otpSent) {
        const { error } = await supabase.auth.signInWithOtp({
          phone: phone,
        });

        if (error) throw error;

        setOtpSent(true);
        toast({
          title: "OTP sent",
          description: "Check your phone for the verification code.",
        });
      } else {
        const { data, error } = await supabase.auth.verifyOtp({
          phone: phone,
          token: otp,
          type: 'sms'
        });

        if (error) throw error;

        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed, first_login')
          .eq('id', data.user.id)
          .single();

        const needsOnboarding = profile?.first_login === true || profile?.onboarding_completed === false;

        toast({
          title: needsOnboarding ? "Welcome!" : "Welcome back!",
          description: needsOnboarding 
            ? "Let's set up your account" 
            : "You have successfully signed in.",
        });

        navigate(needsOnboarding ? "/onboarding" : "/dashboard");
      }
    } catch (error: any) {
      toast({
        title: otpSent ? "Verification failed" : "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setResetEmailSent(true);
      toast({
        title: "Check your email",
        description: "We've sent you a password reset link.",
      });
    } catch (error: any) {
      toast({
        title: "Reset failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md space-y-4">
        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl">
              {resetEmailSent ? "Check Your Email" : isForgotPassword ? "Reset Password" : "Welcome Back"}
            </CardTitle>
            <CardDescription>
              {resetEmailSent 
                ? "We've sent password reset instructions to your email" 
                : isForgotPassword 
                  ? "Enter your email to receive reset instructions" 
                  : "Invitation-only access to Claimed System"}
            </CardDescription>
          </CardHeader>
          
          {resetEmailSent ? (
            <CardContent className="space-y-4">
              <div className="text-center py-4">
                <div className="text-4xl mb-2">📧</div>
                <p className="text-sm text-muted-foreground mb-4">{email}</p>
                <p className="text-sm text-muted-foreground">
                  Didn't receive it? Check your spam folder or try again.
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setResetEmailSent(false);
                  setIsForgotPassword(false);
                }}
              >
                ← Back to login
              </Button>
            </CardContent>
          ) : isForgotPassword ? (
            <form onSubmit={handlePasswordReset}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="knight@tibia.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
                
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setIsForgotPassword(false)}
                  disabled={loading}
                >
                  ← Back to login
                </Button>
              </CardContent>
            </form>
          ) : (
            <CardContent className="space-y-4">
              <Tabs value={authMethod} onValueChange={(v) => setAuthMethod(v as "email" | "phone")} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="email" className="gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </TabsTrigger>
                  <TabsTrigger value="phone" className="gap-2">
                    <Phone className="h-4 w-4" />
                    Phone
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="email" className="space-y-4 mt-4">
                  <form onSubmit={handleAuth} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="knight@tibia.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setIsForgotPassword(true)}
                        className="text-sm text-primary hover:underline"
                        disabled={loading}
                      >
                        Forgot password?
                      </button>
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Loading..." : "Login"}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="phone" className="space-y-4 mt-4">
                  <form onSubmit={handlePhoneAuth} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1234567890"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        disabled={loading || otpSent}
                      />
                      <p className="text-xs text-muted-foreground">
                        Include country code (e.g., +1 for US)
                      </p>
                    </div>
                    
                    {otpSent && (
                      <div className="space-y-2">
                        <Label htmlFor="otp">Verification Code</Label>
                        <Input
                          id="otp"
                          type="text"
                          placeholder="123456"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          required
                          disabled={loading}
                          maxLength={6}
                        />
                      </div>
                    )}
                    
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Loading..." : otpSent ? "Verify Code" : "Send Code"}
                    </Button>
                    
                    {otpSent && (
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full"
                        onClick={() => {
                          setOtpSent(false);
                          setOtp("");
                        }}
                        disabled={loading}
                      >
                        ← Use different number
                      </Button>
                    )}
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          )}
        </Card>

        <div className="space-y-2">
          <p className="text-center text-sm text-muted-foreground">
            Need access to the system?
          </p>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.open("https://forms.gle/e5GZKnxPhm5opPTB7", "_blank")}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Request Access
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}
