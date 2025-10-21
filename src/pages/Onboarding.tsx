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
  const [soundUnlocked, setSoundUnlocked] = useState(false);

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

  const handleUnlockSound = async () => {
    setLoading(true);
    try {
      const success = await NotificationSound.unlockAudio();
      
      if (success) {
        setSoundUnlocked(true);
        // Play test sound
        NotificationSound.play('high');
        
        toast({ 
          title: "🔊 Som desbloqueado!", 
          description: "Você ouvirá alertas sonoros como esse" 
        });
      }
    } catch (error) {
      console.error('Error unlocking sound:', error);
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
          title: "✅ Notificações desktop ativadas!", 
          description: "Você receberá alertas visuais importantes" 
        });
        
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
                  Configure Alertas e Notificações
                </CardTitle>
                <CardDescription>
                  Para não perder sua vez, configure os alertas sonoros e notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Important warning */}
                <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
                  <p className="text-sm text-foreground">
                    ⚠️ <span className="font-medium">Importante:</span> Os navegadores bloqueiam sons por padrão. Você precisa clicar no botão abaixo para habilitar os alertas sonoros.
                  </p>
                </div>

                {/* Step 1: Unlock Sound */}
                <div className="p-4 rounded-lg border-2 border-border bg-card">
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`p-2 rounded-md ${soundUnlocked ? 'bg-green-500/20' : 'bg-primary/20'}`}>
                      <Volume2 className={`h-5 w-5 ${soundUnlocked ? 'text-green-500' : 'text-primary'}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        1. Habilitar Alertas Sonoros
                        {soundUnlocked && <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded">✓ Ativado</span>}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Sons especiais tocam quando for sua vez, mesmo com o navegador minimizado
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleUnlockSound} 
                    className="w-full"
                    disabled={loading || soundUnlocked}
                    variant={soundUnlocked ? "outline" : "default"}
                  >
                    {soundUnlocked ? "✓ Som Habilitado" : "🔊 Clique para Testar o Som"}
                  </Button>
                </div>

                {/* Step 2: Desktop Notifications */}
                <div className="p-4 rounded-lg border-2 border-border bg-card">
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`p-2 rounded-md ${notificationDecision === true ? 'bg-green-500/20' : 'bg-primary/20'}`}>
                      <Bell className={`h-5 w-5 ${notificationDecision === true ? 'text-green-500' : 'text-primary'}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        2. Habilitar Notificações Desktop
                        {notificationDecision === true && <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded">✓ Ativado</span>}
                        {notificationDecision === false && <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">Desativado</span>}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Alertas visuais aparecem na sua área de trabalho (opcional mas recomendado)
                      </p>
                    </div>
                  </div>
                  
                  {notificationDecision === null && (
                    <div className="space-y-2">
                      <Button 
                        onClick={handleEnableNotifications} 
                        className="w-full"
                        disabled={loading}
                      >
                        📱 Ativar Notificações Desktop
                      </Button>
                      <Button 
                        onClick={handleSkipNotifications} 
                        variant="outline"
                        className="w-full"
                        disabled={loading}
                      >
                        Pular (não recomendado)
                      </Button>
                    </div>
                  )}
                  
                  {notificationDecision !== null && (
                    <div className="p-3 rounded-lg bg-muted/30 text-sm text-muted-foreground">
                      {notificationDecision 
                        ? "✓ Você receberá notificações visuais quando for sua vez"
                        : "⚠️ Você não receberá notificações visuais (pode ativar depois nas configurações)"
                      }
                    </div>
                  )}
                </div>

                {/* Preview */}
                <div className="p-4 rounded-lg border border-primary/30 bg-primary/5">
                  <p className="text-xs text-muted-foreground mb-2">Exemplo de notificação:</p>
                  <div className="flex items-start gap-3">
                    <Bell className="h-4 w-4 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-sm text-foreground">🔥 É sua vez de clamar!</p>
                      <p className="text-xs text-muted-foreground">POI-3 Demon está disponível. Você tem prioridade!</p>
                    </div>
                  </div>
                </div>

                {/* Info box */}
                <div className="p-4 rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground">
                    💡 <span className="font-medium text-foreground">Dica:</span> Recomendamos ativar ambos para não perder nenhum claim importante. Você pode ajustar depois nas configurações.
                  </p>
                </div>

                {/* Continue button */}
                <div className="space-y-3">
                  <Button 
                    className="w-full" 
                    onClick={handleComplete} 
                    disabled={loading || !soundUnlocked}
                  >
                    {loading ? "Finalizando..." : "Concluir e Começar a Usar 🚀"}
                  </Button>
                  
                  {!soundUnlocked && (
                    <p className="text-xs text-center text-muted-foreground">
                      ⚠️ Você precisa habilitar o som para continuar
                    </p>
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
