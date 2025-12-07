import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AuthModal from '@/components/AuthModal';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface TaskHistory {
  id: string;
  title: string;
  subject: string;
  date: Date;
  type: 'math' | 'essay' | 'test';
}

const Index = () => {
  const [activeTab, setActiveTab] = useState<'solve' | 'essay' | 'test' | 'history'>('solve');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Привет! Я MegaChat — твой школьный помощник. Помогу решить задачу, написать сочинение или подготовиться к контрольной!',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('math');
  const [essayTheme, setEssayTheme] = useState('');
  const [essayType, setEssayType] = useState('argument');
  const [testSubject, setTestSubject] = useState('math');
  const [testTopic, setTestTopic] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('megachat_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setIsAuthModalOpen(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('megachat_token');
    localStorage.removeItem('megachat_user');
    setUser(null);
    setIsAuthModalOpen(true);
  };

  const taskHistory: TaskHistory[] = [
    { id: '1', title: 'Квадратные уравнения', subject: 'Математика', date: new Date(2024, 11, 6), type: 'math' },
    { id: '2', title: 'Сочинение: Война и мир', subject: 'Литература', date: new Date(2024, 11, 5), type: 'essay' },
    { id: '3', title: 'Контрольная по физике', subject: 'Физика', date: new Date(2024, 11, 4), type: 'test' },
  ];

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages([...messages, userMessage]);
    const currentInput = inputValue;
    setInputValue('');

    const loadingMessage: Message = {
      id: 'loading',
      text: '🤔 Думаю...',
      sender: 'ai',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      const response = await fetch('https://functions.poehali.dev/1aaf2af2-58db-4ecb-b209-9c8a827b76e3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: currentInput,
          taskType: activeTab,
          subject: selectedSubject
        })
      });

      const data = await response.json();
      
      setMessages(prev => prev.filter(m => m.id !== 'loading'));

      if (response.ok && data.response) {
        const aiMessage: Message = {
          id: Date.now().toString(),
          text: data.response,
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        const errorMessage: Message = {
          id: Date.now().toString(),
          text: `Ошибка: ${data.error || 'Не удалось получить ответ'}. Проверь, что добавлены ключи GigaChat в настройках проекта.`,
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      setMessages(prev => prev.filter(m => m.id !== 'loading'));
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: 'Ошибка подключения к AI. Проверь интернет-соединение.',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const renderSolveContent = () => (
    <div className="flex flex-col h-full">
      <div className="border-b border-border p-6 bg-accent/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <Icon name="Calculator" size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Решение задач</h2>
            <p className="text-sm text-muted-foreground">Помогу разобраться с любым предметом</p>
          </div>
        </div>
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="math">📐 Математика</SelectItem>
            <SelectItem value="physics">⚛️ Физика</SelectItem>
            <SelectItem value="chemistry">🧪 Химия</SelectItem>
            <SelectItem value="russian">📖 Русский язык</SelectItem>
            <SelectItem value="english">🇬🇧 Английский язык</SelectItem>
            <SelectItem value="history">🏛️ История</SelectItem>
            <SelectItem value="biology">🌿 Биология</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 animate-fade-in ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.sender === 'ai' ? 'bg-primary' : 'bg-secondary'
              }`}>
                <span className="text-white font-semibold text-sm">
                  {message.sender === 'ai' ? '🤖' : '👤'}
                </span>
              </div>
              <Card className={`p-4 max-w-[75%] ${
                message.sender === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-card border-2 border-primary/20'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                <p className="text-xs mt-2 opacity-70">
                  {message.timestamp.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </Card>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t border-border p-4 bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Напиши условие задачи или вопрос..."
              className="min-h-[60px] resize-none"
            />
            <Button onClick={handleSendMessage} size="icon" className="h-[60px] w-[60px] hover-scale">
              <Icon name="Send" size={24} />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            💡 Совет: Опиши задачу подробно и укажи, что нужно найти
          </p>
        </div>
      </div>
    </div>
  );

  const renderEssayContent = () => (
    <div className="flex flex-col h-full">
      <div className="border-b border-border p-6 bg-accent/50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <Icon name="FileText" size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Сочинения</h2>
            <p className="text-sm text-muted-foreground">Помогу написать сочинение на любую тему</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <Card className="p-6">
            <Label className="text-base font-semibold mb-3 block">Тип сочинения</Label>
            <Tabs value={essayType} onValueChange={setEssayType} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="argument">Рассуждение</TabsTrigger>
                <TabsTrigger value="description">Описание</TabsTrigger>
                <TabsTrigger value="narrative">Повествование</TabsTrigger>
              </TabsList>
            </Tabs>
          </Card>

          <Card className="p-6">
            <Label className="text-base font-semibold mb-3 block">Предмет</Label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="literature">📚 Литература</SelectItem>
                <SelectItem value="russian">📝 Русский язык</SelectItem>
                <SelectItem value="english">🇬🇧 Английский язык</SelectItem>
                <SelectItem value="history">🏛️ История</SelectItem>
              </SelectContent>
            </Select>
          </Card>

          <Card className="p-6">
            <Label className="text-base font-semibold mb-3 block">Тема сочинения</Label>
            <Textarea
              value={essayTheme}
              onChange={(e) => setEssayTheme(e.target.value)}
              placeholder='Например: "Образ Печорина в романе Герой нашего времени"'
              className="min-h-[100px]"
            />
          </Card>

          <Card className="p-6">
            <Label className="text-base font-semibold mb-3 block">Дополнительные требования</Label>
            <Textarea
              placeholder="Укажи объём, ключевые моменты, которые нужно раскрыть..."
              className="min-h-[100px]"
            />
          </Card>

          <Button className="w-full h-12 text-base hover-scale" size="lg">
            <Icon name="Sparkles" size={20} className="mr-2" />
            Создать сочинение
          </Button>

          <Card className="p-4 bg-primary/10 border-primary/30">
            <div className="flex gap-3">
              <Icon name="Info" size={20} className="text-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Структура сочинения:</p>
                <p>• Вступление с тезисом</p>
                <p>• Основная часть с аргументами</p>
                <p>• Заключение с выводами</p>
              </div>
            </div>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );

  const renderTestContent = () => (
    <div className="flex flex-col h-full">
      <div className="border-b border-border p-6 bg-accent/50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <Icon name="ClipboardCheck" size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Контрольные работы</h2>
            <p className="text-sm text-muted-foreground">Подготовлю тесты и задания для проверки знаний</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <Card className="p-6">
            <Label className="text-base font-semibold mb-3 block">Предмет</Label>
            <Select value={testSubject} onValueChange={setTestSubject}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="math">📐 Математика</SelectItem>
                <SelectItem value="physics">⚛️ Физика</SelectItem>
                <SelectItem value="chemistry">🧪 Химия</SelectItem>
                <SelectItem value="russian">📖 Русский язык</SelectItem>
                <SelectItem value="biology">🌿 Биология</SelectItem>
                <SelectItem value="history">🏛️ История</SelectItem>
                <SelectItem value="geography">🌍 География</SelectItem>
              </SelectContent>
            </Select>
          </Card>

          <Card className="p-6">
            <Label className="text-base font-semibold mb-3 block">Тема контрольной</Label>
            <Input
              value={testTopic}
              onChange={(e) => setTestTopic(e.target.value)}
              placeholder="Например: Квадратные уравнения, Периодическая система..."
            />
          </Card>

          <Card className="p-6">
            <Label className="text-base font-semibold mb-3 block">Уровень сложности</Label>
            <Tabs defaultValue="medium" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="easy">Базовый</TabsTrigger>
                <TabsTrigger value="medium">Средний</TabsTrigger>
                <TabsTrigger value="hard">Сложный</TabsTrigger>
              </TabsList>
            </Tabs>
          </Card>

          <Card className="p-6">
            <Label className="text-base font-semibold mb-3 block">Количество заданий</Label>
            <div className="grid grid-cols-4 gap-3">
              {[5, 10, 15, 20].map(num => (
                <Button key={num} variant="outline" className="h-12">
                  {num}
                </Button>
              ))}
            </div>
          </Card>

          <Button className="w-full h-12 text-base hover-scale" size="lg">
            <Icon name="FileCheck" size={20} className="mr-2" />
            Создать контрольную
          </Button>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="CheckCircle" size={18} className="text-primary" />
                <h4 className="font-medium">Что включено</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Задания разных типов</li>
                <li>• Правильные ответы</li>
                <li>• Критерии оценки</li>
              </ul>
            </Card>
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Target" size={18} className="text-primary" />
                <h4 className="font-medium">Формат заданий</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Тесты с выбором</li>
                <li>• Задачи с решением</li>
                <li>• Открытые вопросы</li>
              </ul>
            </Card>
          </div>
        </div>
      </ScrollArea>
    </div>
  );

  const renderHistoryContent = () => (
    <div className="flex flex-col h-full">
      <div className="border-b border-border p-6 bg-accent/50">
        <h2 className="text-2xl font-bold text-foreground mb-1">История заданий</h2>
        <p className="text-sm text-muted-foreground">Все твои решённые задачи и работы</p>
      </div>
      <ScrollArea className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-3">
          {taskHistory.map((task) => (
            <Card key={task.id} className="p-5 hover-scale cursor-pointer transition-all hover:shadow-lg hover:border-primary/40">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    task.type === 'math' ? 'bg-blue-100 text-blue-600' :
                    task.type === 'essay' ? 'bg-purple-100 text-purple-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    <Icon 
                      name={task.type === 'math' ? 'Calculator' : task.type === 'essay' ? 'FileText' : 'ClipboardCheck'} 
                      size={24} 
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground text-lg">{task.title}</h3>
                      <Badge variant="outline" className="text-xs">{task.subject}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {task.date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <Icon name="ChevronRight" size={24} className="text-muted-foreground" />
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'solve':
        return renderSolveContent();
      case 'essay':
        return renderEssayContent();
      case 'test':
        return renderTestContent();
      case 'history':
        return renderHistoryContent();
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <div className="w-72 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Icon name="GraduationCap" size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">MegaChat</h1>
              <p className="text-xs text-muted-foreground">Школьный помощник</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {[
              { id: 'solve', label: 'Решение задач', icon: 'Calculator', color: 'bg-blue-500/10 text-blue-600' },
              { id: 'essay', label: 'Сочинения', icon: 'FileText', color: 'bg-purple-500/10 text-purple-600' },
              { id: 'test', label: 'Контрольные', icon: 'ClipboardCheck', color: 'bg-green-500/10 text-green-600' },
              { id: 'history', label: 'История', icon: 'Clock', color: 'bg-orange-500/10 text-orange-600' },
            ].map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? 'default' : 'ghost'}
                className={`w-full justify-start transition-all h-11 ${
                  activeTab !== item.id ? 'hover:bg-accent' : ''
                }`}
                onClick={() => setActiveTab(item.id as any)}
              >
                <Icon name={item.icon as any} size={20} className="mr-3" />
                <span className="font-medium">{item.label}</span>
              </Button>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-sidebar-border space-y-3">
          {user ? (
            <Card className="p-4 bg-accent/50">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="w-10 h-10 bg-primary">
                  <AvatarFallback className="text-white font-semibold">
                    {user.name?.charAt(0) || 'У'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={handleLogout}
              >
                <Icon name="LogOut" size={16} className="mr-2" />
                Выйти
              </Button>
            </Card>
          ) : (
            <Button 
              className="w-full"
              onClick={() => setIsAuthModalOpen(true)}
            >
              <Icon name="LogIn" size={18} className="mr-2" />
              Войти
            </Button>
          )}
          
          <Card className="p-4 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
            <div className="flex items-start gap-3">
              <Icon name="Lightbulb" size={20} className="text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm mb-1">Подсказка</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Чем подробнее опишешь задачу, тем точнее будет решение!
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {renderContent()}
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(userData) => setUser(userData)}
      />
    </div>
  );
};

export default Index;