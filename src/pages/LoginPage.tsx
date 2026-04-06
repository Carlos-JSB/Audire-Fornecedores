// Tela de login do protótipo.
// Credenciais válidas: qualquer usuário + qualquer senha com pelo menos 1 caractere cada.
// Atalho de demonstração: usuário "admin" / senha "admin" (exibido na própria tela).
// TODO: substituir por autenticação real — POST /api/auth/login → JWT → contexto de sessão

import { useState } from 'react';
import { Shield } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (username.trim().length === 0 || password.trim().length === 0) {
      setError('Preencha todos os campos');
      return;
    }
    // TODO: validar contra POST /api/auth/login em produção
    // No protótipo, qualquer credencial não-vazia é aceita
    onLogin();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center space-y-2 pb-2">
          <div className="flex justify-center">
            <div className="p-2.5 rounded-lg bg-primary">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">SRM</h1>
            <p className="text-sm text-muted-foreground">Supplier Risk Management</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Usuário</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(''); }}
              onKeyDown={handleKeyDown}
              placeholder="Digite seu usuário"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua senha"
            />
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <Button className="w-full" onClick={handleSubmit}>Entrar</Button>
          <p className="text-xs text-muted-foreground text-center">
            Protótipo — use <strong>admin</strong> / <strong>admin</strong> para acessar
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
