import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Clock, Shield, UserPlus, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { AuthLayout } from "@/components/AuthLayout";

const STEPS = [
  { id: 1, title: "Alterar Senha", icon: Shield },
  { id: 2, title: "Criar Personagem", icon: UserPlus },
  { id: 3, title: "Informações", icon: Clock },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { changePassword, markPasswordChanged, completeOnboarding } = useOnboarding(user?.id);
  const { addCharacter } = useProfile(user?.id);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Password Change
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 2: Character Creation
  const [charName, setCharName] = useState("");

  const validatePassword = (password: string): { valid: boolean; error?: string } => {
    if (password === '123123') {
      return { valid: false, error: 'Você não pode usar a senha temporária' };
    }
    if (password.length < 8) {
      return { valid: false, error: 'A senha deve ter pelo menos 8 caracteres' };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, error: 'A senha deve conter pelo menos uma letra maiúscula' };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, error: 'A senha deve conter pelo menos uma letra minúscula' };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, error: 'A senha deve conter pelo menos um número' };
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
                      placeholder="Mínimo 8 caracteres"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      disabled={loading}
                      minLength={8}
                    />
                    <p className="text-xs text-muted-foreground">
                      Deve conter: 8+ caracteres, maiúsculas, minúsculas e números
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

                <Button onClick={handleComplete} className="w-full" disabled={loading}>
                  {loading ? "Finalizando..." : "Entendido, Começar!"}
                </Button>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </AuthLayout>
  );
}
