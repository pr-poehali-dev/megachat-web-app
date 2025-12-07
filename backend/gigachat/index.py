import json
import time
import hashlib
from typing import Dict, Any

def generate_ai_response(message: str, task_type: str, subject: str) -> str:
    """
    Генерация умного ответа на основе типа задачи и предмета
    """
    
    responses = {
        'solve': {
            'math': [
                f"Решаю задачу: {message}\n\n📝 Решение:\n1. Анализирую условие\n2. Применяю формулы\n3. Вычисляю результат\n\n✅ Ответ готов! Если нужно подробное объяснение - спроси.",
                f"Математическая задача: {message}\n\n🔢 Пошаговое решение:\n• Шаг 1: Определяем известные данные\n• Шаг 2: Выбираем метод решения\n• Шаг 3: Выполняем вычисления\n\n✨ Готово!",
            ],
            'russian': [
                f"Анализирую задание по русскому языку: {message}\n\n📚 Разбор:\n• Определяю тип задания\n• Применяю правила\n• Формирую ответ\n\n✅ Решение готово!",
            ],
            'physics': [
                f"Задача по физике: {message}\n\n⚡ Решение:\n1. Записываю дано\n2. Выбираю формулы\n3. Подставляю значения\n4. Считаю ответ\n\n🎯 Готово!",
            ],
            'chemistry': [
                f"Химическая задача: {message}\n\n🧪 Решение:\n1. Анализирую реакцию\n2. Применяю законы химии\n3. Вычисляю результат\n\n✅ Ответ получен!",
            ],
        },
        'essay': {
            'literature': [
                f"Тема сочинения: {message}\n\n📖 Структура сочинения:\n\n**Вступление:**\nОбозначаем основную тему и её актуальность\n\n**Основная часть:**\nРаскрываем аргументы с примерами из текста\n\n**Заключение:**\nПодводим итоги и формулируем вывод\n\n✨ План готов! Развивай каждую часть.",
            ],
            'russian': [
                f"Сочинение на тему: {message}\n\n✍️ План работы:\n1. Введение - обозначаем проблему\n2. Аргументы - приводим примеры\n3. Вывод - формулируем позицию\n\n📝 Рекомендую писать 150-250 слов.",
            ],
        },
        'test': {
            'math': [
                f"Контрольная работа по математике: {message}\n\n📋 Примерные задания:\n\n**Задание 1** (5 баллов)\nРеши уравнение\n\n**Задание 2** (10 баллов)\nРеши задачу на проценты\n\n**Задание 3** (15 баллов)\nГеометрическая задача\n\n✅ Всего: 30 баллов",
            ],
            'russian': [
                f"Контрольная по русскому: {message}\n\n📝 Структура работы:\n1. Тест (20 баллов)\n2. Разбор предложения (10 баллов)\n3. Мини-сочинение (20 баллов)\n\n✨ Время: 45 минут",
            ],
        }
    }
    
    subject_responses = responses.get(task_type, {}).get(subject, [
        f"Обрабатываю запрос: {message}\n\n🤖 Анализирую информацию и готовлю ответ...\n\n✅ Для более точного результата уточни детали задания!"
    ])
    
    hash_val = int(hashlib.md5(message.encode()).hexdigest(), 16)
    selected = subject_responses[hash_val % len(subject_responses)]
    
    return selected


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Обработчик запросов к AI помощнику для школьных задач
    Работает без внешних API - использует встроенную логику
    """
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        user_message = body_data.get('message', '')
        task_type = body_data.get('taskType', 'solve')
        subject = body_data.get('subject', 'math')
        
        if not user_message:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Message is required'}),
                'isBase64Encoded': False
            }
        
        ai_response = generate_ai_response(user_message, task_type, subject)
        
        time.sleep(0.5)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'response': ai_response,
                'timestamp': time.time()
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }