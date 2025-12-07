import json
import os
from typing import Dict, Any
import jwt
import time

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Обработчик авторизации для MegaChat
    Создает JWT токены для аутентифицированных пользователей
    """
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
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
        provider = body_data.get('provider', '')
        user_data = body_data.get('userData', {})
        
        if not provider or not user_data:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Provider and userData are required'}),
                'isBase64Encoded': False
            }
        
        user_id = user_data.get('id') or user_data.get('sub')
        email = user_data.get('email', '')
        name = user_data.get('name', '')
        
        secret_key = os.environ.get('JWT_SECRET', 'megachat-secret-key-2024')
        
        token_payload = {
            'user_id': user_id,
            'email': email,
            'name': name,
            'provider': provider,
            'iat': int(time.time()),
            'exp': int(time.time()) + 86400 * 30
        }
        
        token = jwt.encode(token_payload, secret_key, algorithm='HS256')
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'token': token,
                'user': {
                    'id': user_id,
                    'email': email,
                    'name': name,
                    'provider': provider
                }
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
