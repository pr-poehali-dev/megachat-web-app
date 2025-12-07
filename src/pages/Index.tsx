import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ChatHistory {
  id: string;
  title: string;
  date: Date;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'history' | 'settings' | 'profile'>('chat');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Привет! Я MegaChat — ваш AI-ассистент. Чем могу помочь?',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [temperature, setTemperature] = useState([0.7]);
  const [maxTokens, setMaxTokens] = useState([2000]);
  const [responseStyle, setResponseStyle] = useState('balanced');

  const chatHistory: ChatHistory[] = [
    { id: '1', title: 'Вопросы по программированию', date: new Date(2024, 11, 5) },
    { id: '2', title: 'Планирование проекта', date: new Date(2024, 11, 4) },
    { id: '3', title: 'Анализ данных', date: new Date(2024, 11, 3) },
  ];

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages([...messages, userMessage]);
    setInputValue('');

    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Это демонстрационный ответ. В реальной версии здесь будет ответ от AI-модели на основе ваших настроек.',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  const renderChatContent = () => (
    <div className="flex flex-col h-full">
      <div className="border-b border-border p-4">
        <h2 className="text-xl font-semibold text-foreground">MegaChat</h2>
        <p className="text-sm text-muted-foreground">Настраиваемый AI-ассистент</p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <Avatar className={message.sender === 'ai' ? 'bg-primary' : 'bg-secondary'}>
                <AvatarFallback className="text-white">
                  {message.sender === 'ai' ? 'AI' : 'Вы'}
                </AvatarFallback>
              </Avatar>
              <Card className={`p-4 max-w-[80%] ${message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
                <p className="text-sm">{message.text}</p>
                <p className="text-xs mt-2 opacity-70">
                  {message.timestamp.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </Card>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t border-border p-4">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Введите сообщение..."
            className="flex-1"
          />
          <Button onClick={handleSendMessage} size="icon" className="hover-scale">
            <Icon name="Send" size={20} />
          </Button>
        </div>
      </div>
    </div>
  );

  const renderHistoryContent = () => (
    <div className="flex flex-col h-full">
      <div className="border-b border-border p-4">
        <h2 className="text-xl font-semibold text-foreground">История диалогов</h2>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {chatHistory.map((chat) => (
            <Card key={chat.id} className="p-4 hover-scale cursor-pointer transition-all hover:shadow-md">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Icon name="MessageSquare" size={20} className="text-primary mt-1" />
                  <div>
                    <h3 className="font-medium text-foreground">{chat.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {chat.date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <Icon name="ChevronRight" size={20} className="text-muted-foreground" />
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  const renderSettingsContent = () => (
    <div className="flex flex-col h-full">
      <div className="border-b border-border p-4">
        <h2 className="text-xl font-semibold text-foreground">Настройки модели</h2>
        <p className="text-sm text-muted-foreground">Настройте поведение AI под ваши задачи</p>
      </div>
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-8 max-w-2xl">
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Температура ({temperature[0]})</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Контролирует креативность ответов. Низкие значения — более точные ответы, высокие — более творческие.
                </p>
                <Slider
                  value={temperature}
                  onValueChange={setTemperature}
                  min={0}
                  max={2}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>Точные (0)</span>
                  <span>Креативные (2)</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Максимальная длина ответа ({maxTokens[0]} токенов)</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Определяет максимальную длину генерируемого ответа.
                </p>
                <Slider
                  value={maxTokens}
                  onValueChange={setMaxTokens}
                  min={100}
                  max={4000}
                  step={100}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>Короткие (100)</span>
                  <span>Длинные (4000)</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="space-y-4">
              <Label className="text-base font-medium">Стиль ответов</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Выберите стиль общения AI-ассистента.
              </p>
              <Select value={responseStyle} onValueChange={setResponseStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="concise">Краткий — минимум слов</SelectItem>
                  <SelectItem value="balanced">Сбалансированный — оптимальная детализация</SelectItem>
                  <SelectItem value="detailed">Детальный — подробные объяснения</SelectItem>
                  <SelectItem value="technical">Технический — для специалистов</SelectItem>
                  <SelectItem value="simple">Простой — доступный язык</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          <Card className="p-6 bg-accent">
            <div className="flex gap-3">
              <Icon name="Lightbulb" size={24} className="text-primary flex-shrink-0" />
              <div>
                <h3 className="font-medium mb-2">Настройка под задачи</h3>
                <p className="text-sm text-muted-foreground">
                  Для кодирования: температура 0.2-0.5, стиль технический.
                  <br />
                  Для творчества: температура 1.0-1.5, стиль детальный.
                  <br />
                  Для анализа: температура 0.3-0.7, стиль сбалансированный.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );

  const renderProfileContent = () => (
    <div className="flex flex-col h-full">
      <div className="border-b border-border p-4">
        <h2 className="text-xl font-semibold text-foreground">Профиль</h2>
      </div>
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6 max-w-2xl">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20 bg-primary">
                <AvatarFallback className="text-2xl text-white">МЧ</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">MegaChat Пользователь</h3>
                <p className="text-sm text-muted-foreground">megachat@example.com</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-medium mb-4">Статистика использования</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-accent rounded-lg">
                <span className="text-sm">Всего диалогов</span>
                <span className="font-semibold text-primary">24</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-accent rounded-lg">
                <span className="text-sm">Сообщений отправлено</span>
                <span className="font-semibold text-primary">156</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-accent rounded-lg">
                <span className="text-sm">Токенов использовано</span>
                <span className="font-semibold text-primary">45,230</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-medium mb-4">Настройки аккаунта</h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Icon name="Key" size={18} className="mr-2" />
                Изменить пароль
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Icon name="Bell" size={18} className="mr-2" />
                Уведомления
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Icon name="Globe" size={18} className="mr-2" />
                Язык интерфейса
              </Button>
            </div>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'chat':
        return renderChatContent();
      case 'history':
        return renderHistoryContent();
      case 'settings':
        return renderSettingsContent();
      case 'profile':
        return renderProfileContent();
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Icon name="Sparkles" size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">MegaChat</h1>
              <p className="text-xs text-muted-foreground">AI Assistant</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {[
              { id: 'chat', label: 'Чат', icon: 'MessageSquare' },
              { id: 'history', label: 'История', icon: 'Clock' },
              { id: 'settings', label: 'Настройки', icon: 'Settings' },
              { id: 'profile', label: 'Профиль', icon: 'User' },
            ].map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? 'default' : 'ghost'}
                className="w-full justify-start transition-all"
                onClick={() => setActiveTab(item.id as any)}
              >
                <Icon name={item.icon as any} size={20} className="mr-3" />
                {item.label}
              </Button>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <Card className="p-3 bg-accent">
            <div className="flex items-start gap-2">
              <Icon name="Info" size={16} className="text-primary mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                Настройте модель под свои задачи в разделе настроек
              </p>
            </div>
          </Card>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {renderContent()}
      </div>
    </div>
  );
};

export default Index;
