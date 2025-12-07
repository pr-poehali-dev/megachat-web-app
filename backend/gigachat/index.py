import json
import os
import requests
import time
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Обработчик запросов к YandexGPT (Алиса AI) для школьных задач
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
        
        api_key = os.environ.get('YANDEX_API_KEY', '')
        folder_id = os.environ.get('YANDEX_FOLDER_ID', '')
        
        system_prompts = {
            'solve': f'Ты - школьный помощник по предмету {subject}. Объясняй решения подробно и пошагово, как учитель для школьника. Используй простой язык.',
            'essay': 'Ты - помощник для написания сочинений. Создавай структурированные тексты с вступлением, основной частью и заключением.',
            'test': f'Ты - генератор контрольных работ по предмету {subject}. Создавай задания с ответами и критериями оценки.'
        }
        
        system_prompt = system_prompts.get(task_type, system_prompts['solve'])
        
        url = 'https://llm.api.cloud.yandex.net/foundationModels/v1/completion'
        
        payload = {
            'modelUri': f'gpt://{folder_id}/yandexgpt-lite',
            'completionOptions': {
                'stream': False,
                'temperature': 0.6,
                'maxTokens': 2000
            },
            'messages': [
                {'role': 'system', 'text': system_prompt},
                {'role': 'user', 'text': user_message}
            ]
        }
        
        response = requests.post(
            url,
            headers={
                'Authorization': f'Api-Key {api_key}',
                'Content-Type': 'application/json'
            },
            json=payload
        )
        
        if response.status_code != 200:
            return {
                'statusCode': response.status_code,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': f'YandexGPT API error: {response.text}'}),
                'isBase64Encoded': False
            }
        
        result = response.json()
        ai_response = result['result']['alternatives'][0]['message']['text']
        
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
