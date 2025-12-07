import json
import os
import requests
import time
from typing import Dict, Any

def get_access_token() -> str:
    """
    Получение access токена для GigaChat API
    """
    client_id = os.environ['GIGACHAT_CLIENT_ID']
    client_secret = os.environ['GIGACHAT_CLIENT_SECRET']
    
    url = 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth'
    
    response = requests.post(
        url,
        headers={'Content-Type': 'application/x-www-form-urlencoded'},
        data={'scope': 'GIGACHAT_API_PERS'},
        auth=(client_id, client_secret),
        verify=False
    )
    
    if response.status_code != 200:
        raise Exception(f'Failed to get token: {response.text}')
    
    return response.json()['access_token']

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Обработчик запросов к GigaChat для школьных задач
    Принимает сообщение пользователя и возвращает ответ от AI
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
        
        access_token = get_access_token()
        
        system_prompts = {
            'solve': f'Ты - школьный помощник по предмету {subject}. Объясняй решения подробно и пошагово, как учитель для школьника. Используй простой язык.',
            'essay': 'Ты - помощник для написания сочинений. Создавай структурированные тексты с вступлением, основной частью и заключением.',
            'test': f'Ты - генератор контрольных работ по предмету {subject}. Создавай задания с ответами и критериями оценки.'
        }
        
        system_prompt = system_prompts.get(task_type, system_prompts['solve'])
        
        url = 'https://gigachat.devices.sberbank.ru/api/v1/chat/completions'
        
        payload = {
            'model': 'GigaChat',
            'messages': [
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': user_message}
            ],
            'temperature': 0.7,
            'max_tokens': 2000
        }
        
        response = requests.post(
            url,
            headers={
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            },
            json=payload,
            verify=False
        )
        
        if response.status_code != 200:
            return {
                'statusCode': response.status_code,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': f'GigaChat API error: {response.text}'}),
                'isBase64Encoded': False
            }
        
        result = response.json()
        ai_response = result['choices'][0]['message']['content']
        
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
