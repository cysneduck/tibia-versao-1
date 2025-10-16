import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Clock, Shield, UserPlus, CheckCircle2, Bell, Volume2, Smartphone } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { AuthLayout } from "@/components/AuthLayout";
import { useDesktopNotifications } from "@/hooks/useDesktopNotifications";
import { NotificationSound } from "@/utils/notificationSounds";

const STEPS = [
  { id: 1, title: "Alterar Senha", icon: Shield },
  { id: 2, title: "Criar Personagem", icon: UserPlus },
  { id: 3, title: "Informações", icon: Clock },
  { id: 4, title: "Notificações", icon: Bell },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { changePassword, markPasswordChanged, completeOnboarding } = useOnboarding(user?.id);
  const { addCharacter, updateProfile } = useProfile(user?.id);
  const { requestPermission, showNotification, hasPermission } = useDesktopNotifications();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Password Change
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 2: Character Creation
  const [charName, setCharName] = useState("");
  
  // Step 4: Notification Permission
  const [notificationDecision, setNotificationDecision] = useState<boolean | null>(null);

  const validatePassword = (password: string): { valid: boolean; error?: string } => {
    if (password === '123123') {
      return { valid: false, error: 'Você não pode usar a senha temporária' };
    }
    if (password.length === 0) {
      return { valid: false, error: 'A senha não pode estar vazia' };
    }
    return { valid: true };
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      return;
    }

    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      toast({
        title: "Senha inválida",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await changePassword.mutateAsync({ newPassword });
      await markPasswordChanged.mutateAsync();
      toast({
        title: "Senha alterada!",
        description: "Sua senha foi atualizada com sucesso.",
      });
      setCurrentStep(2);
    } catch (error: any) {
      toast({
        title: "Erro ao alterar senha",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCharacterCreation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!charName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, insira o nome do personagem",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await addCharacter.mutateAsync({
        name: charName,
      });
      toast({
        title: "Personagem criado!",
        description: `${charName} foi adicionado à sua conta.`,
      });
      setCurrentStep(3);
    } catch (error: any) {
      toast({
        title: "Erro ao criar personagem",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEnableNotifications = async () => {
    setLoading(true);
    try {
      const result = await requestPermission();
      
      if (result === 'granted') {
        // Update profile to enable desktop notifications
        await updateProfile.mutateAsync({ desktop_notifications: true });
        
        // Show success toast
        toast({ 
          title: "✅ Notificações ativadas!", 
          description: "Você receberá alertas importantes sobre respawns" 
        });
        
        // Play test sound
        NotificationSound.play('high');
        
        // Show test notification
        showNotification({
          title: "🎉 Tudo pronto!",
          body: "Você receberá notificações como esta quando for sua vez de clamar",
          priority: 'high'
        });
        
        setNotificationDecision(true);
      } else {
        setNotificationDecision(false);
        toast({
          title: "Notificações não ativadas",
          description: "Você pode ativar depois nas configurações",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkipNotifications = async () => {
    setLoading(true);
    try {
      await updateProfile.mutateAsync({ desktop_notifications: false });
      setNotificationDecision(false);
      toast({
        title: "Notificações desativadas",
        description: "Você pode ativar depois nas configurações do perfil",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      await completeOnboarding.mutateAsync();
      navigate("/dashboard");
    } catch (error) {
      // Error already handled in mutation
    } finally {
      setLoading(false);
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <AuthLayout>
      <div className="w-full max-w-2xl space-y-6">
        {/* Progress Bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Configuração da Conta</span>
            <span className="text-foreground font-medium">Etapa {currentStep} de {STEPS.length}</span>
          </div>
          <Progress value={progress} className="h-2" />
          
          {/* Step Indicators */}
          <div className="flex items-center justify-between pt-2">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex flex-col items-center gap-2 flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isCompleted
                        ? "bg-primary text-primary-foreground"
                        : isActive
                        ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <span
                    className={`text-xs font-medium text-center ${
                      isActive ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <Card className="border-border bg-card/50 backdrop-blur-sm">
          {currentStep === 1 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Bem-vindo! Primeiro, vamos alterar sua senha
                </CardTitle>
                <CardDescription>
                  Por segurança, você precisa alterar sua senha temporária
                </CardDescription>
              </CardHeader>
              <form onSubmit={handlePasswordChange}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nova Senha</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Digite sua nova senha"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Escolha qualquer senha que você possa lembrar facilmente
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Digite a senha novamente"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Alterando..." : "Alterar Senha e Continuar"}
                  </Button>
                </CardContent>
              </form>
            </>
          )}

          {currentStep === 2 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-primary" />
                  Crie seu primeiro personagem
                </CardTitle>
                <CardDescription>
                  Você precisa de pelo menos um personagem para reclamar respawns
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleCharacterCreation}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="charName">Nome do Personagem *</Label>
                    <Input
                      id="charName"
                      value={charName}
                      onChange={(e) => setCharName(e.target.value)}
                      placeholder="Digite o nome do personagem"
                      required
                      disabled={loading}
                      maxLength={50}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Criando..." : "Criar Personagem e Continuar"}
                  </Button>
                </CardContent>
              </form>
            </>
          )}

          {currentStep === 3 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Importante: Tempo de Reclamação
                </CardTitle>
                <CardDescription>
                  Entenda os tempos de claimed por tipo de usuário
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border border-secondary/50 bg-secondary/5">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-md bg-secondary/20">
                        <Clock className="h-5 w-5 text-secondary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1">👤 Neutros</h4>
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">1 hora e 15 minutos</span> de claimed
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Tempo padrão para todos os jogadores
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border border-primary/50 bg-primary/5">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-md bg-primary/20">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1">⚔️ Membros das Guilds</h4>
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">2 horas e 30 minutos</span> de claimed
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Tempo estendido para membros confirmados
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-muted/30 space-y-2">
                  <p className="text-sm text-muted-foreground">
                    💡 <span className="font-medium text-foreground">Dica:</span> Você pode criar mais personagens depois no seu Perfil
                  </p>
                  <p className="text-sm text-muted-foreground">
                    🔒 Seu tipo de usuário é definido pelos administradores
                  </p>
                </div>

                <Button onClick={() => setCurrentStep(4)} className="w-full">
                  Continuar
                </Button>
              </CardContent>
            </>
          )}

          {currentStep === 4 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Ative as Notificações
                </CardTitle>
                <CardDescription>
                  Receba alertas quando for sua vez de clamar um respawn
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Mock notification preview */}
                <div className="p-4 rounded-lg border-2 border-primary/30 bg-primary/5 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-md bg-primary/20">
                      <Bell className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">🔥 É sua vez de clamar!</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        POI-3 Demon está disponível agora. Você tem prioridade!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Benefits list */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Volume2 className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Som de alerta</p>
                      <p className="text-xs text-muted-foreground">Mesmo com o navegador minimizado</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Smartphone className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Notificações desktop</p>
                      <p className="text-xs text-muted-foreground">Alertas visuais na sua área de trabalho</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Nunca perca sua vez</p>
                      <p className="text-xs text-muted-foreground">Saiba exatamente quando clamar</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground">
                    💡 <span className="font-medium text-foreground">Dica:</span> As notificações são essenciais para não perder claims. Você pode desativar depois nas configurações.
                  </p>
                </div>

                {/* Action buttons */}
                <div className="space-y-3">
                  {!hasPermission && notificationDecision === null && (
                    <>
                      <Button 
                        onClick={handleEnableNotifications}
                        className="w-full"
                        disabled={loading}
                      >
                        {loading ? "Ativando..." : "🔔 Ativar Notificações"}
                      </Button>
                      <Button 
                        onClick={handleSkipNotifications}
                        variant="ghost"
                        className="w-full"
                        disabled={loading}
                      >
                        Talvez mais tarde
                      </Button>
                    </>
                  )}
                  
                  {(hasPermission || notificationDecision !== null) && (
                    <Button onClick={handleComplete} className="w-full" disabled={loading}>
                      {loading ? "Finalizando..." : "Começar a usar o sistema! 🚀"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </AuthLayout>
  );
}
