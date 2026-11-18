import functools
from django.core.signing import TimestampSigner, BadSignature, SignatureExpired
from rest_framework.response import Response
from rest_framework import status
from .models import AdminUser

signer = TimestampSigner(salt="boutique-auth-token-v1")
TOKEN_MAX_AGE_SECONDS = 86400 * 7  # 7 days

def generate_token(username):
    return signer.sign(username)

def verify_token(token):
    try:
        username = signer.unsign(token, max_age=TOKEN_MAX_AGE_SECONDS)
        user = AdminUser.objects(username=username, is_active=True).first()
        return user
    except (BadSignature, SignatureExpired):
        return None

def admin_required(view_func):
    @functools.wraps(view_func)
    def wrapper(request, *args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        token = None
        if auth_header.startswith('Bearer '):
            token = auth_header.split('Bearer ')[1].strip()
        elif 'auth_token' in request.COOKIES:
            token = request.COOKIES['auth_token']
        elif 'token' in request.GET:
            token = request.GET['token']

        if not token:
            return Response(
                {"error": "Authentication token missing. Please log in as Admin."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        user = verify_token(token)
        if not user:
            return Response(
                {"error": "Invalid or expired session token. Please log in again."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        request.admin_user = user
        return view_func(request, *args, **kwargs)
    return wrapper
