import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Card } from '@/components/ui/card';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (userData: any) => void;
}

export const AuthModal = ({ isOpen, onClose, onAuthSuccess }: AuthModalProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    
    const mockGoogleUser = {
      id: 'google_' + Date.now(),
      email: 'student@example.com',
      name: 'Школьник',
      provider: 'google'
    };

    try {
      const response = await fetch('https://functions.poehali.dev/0271850f-bf6b-4321-a0a9-57149bad546d', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          provider: 'google',
          userData: mockGoogleUser
        })
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem('megachat_token', data.token);
        localStorage.setItem('megachat_user', JSON.stringify(data.user));
        onAuthSuccess(data.user);
        onClose();
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleYandexAuth = async () => {
    setIsLoading(true);
    
    const mockYandexUser = {
      id: 'yandex_' + Date.now(),
      email: 'student@yandex.ru',
      name: 'Ученик',
      provider: 'yandex'
    };

    try {
      const response = await fetch('https://functions.poehali.dev/0271850f-bf6b-4321-a0a9-57149bad546d', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          provider: 'yandex',
          userData: mockYandexUser
        })
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem('megachat_token', data.token);
        localStorage.setItem('megachat_user', JSON.stringify(data.user));
        onAuthSuccess(data.user);
        onClose();
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Вход в MegaChat</DialogTitle>
          <DialogDescription className="text-center">
            Выбери способ входа для доступа ко всем функциям
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-3">
              <Icon name="Info" size={20} className="text-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Зачем нужна авторизация?</p>
                <p>• Сохранение истории заданий</p>
                <p>• Персональные настройки AI</p>
                <p>• Доступ с любого устройства</p>
              </div>
            </div>
          </Card>

          <div className="space-y-3">
            <Button
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full h-12 text-base"
              variant="outline"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Войти через Google
            </Button>

            <Button
              onClick={handleYandexAuth}
              disabled={isLoading}
              className="w-full h-12 text-base bg-red-600 hover:bg-red-700 text-white"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm4.5 18.5h-2.6v-7.4c0-.7-.1-1.3-.4-1.8-.3-.5-.8-.7-1.5-.7s-1.2.2-1.5.7c-.3.5-.4 1.1-.4 1.8v7.4H7.5V5.5h2.6v1.2c.3-.4.7-.7 1.2-.9.5-.2 1-.3 1.6-.3 1.1 0 2 .4 2.6 1.1.6.7.9 1.7.9 3v9.9z"/>
              </svg>
              Войти через Яндекс
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Продолжая, ты соглашаешься с условиями использования MegaChat
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
