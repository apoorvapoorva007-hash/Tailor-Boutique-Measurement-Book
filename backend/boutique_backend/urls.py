import mimetypes
from pathlib import Path
from django.urls import path, re_path, include
from django.conf import settings
from django.http import HttpResponse, FileResponse

# Ensure standard MIME types on Windows
mimetypes.init()
mimetypes.add_type("application/javascript", ".js", True)
mimetypes.add_type("text/css", ".css", True)
mimetypes.add_type("image/svg+xml", ".svg", True)
mimetypes.add_type("application/json", ".json", True)

FRONTEND_DIST = settings.BASE_DIR.parent / 'frontend' / 'dist'

def serve_spa(request, resource=""):
    """
    Serves the compiled React Vite frontend and all SPA routes from the same Django origin.
    - If resource is an existing static file (JS, CSS, images, favicon), serve with correct MIME.
    - Otherwise (React Router routes: /, /customers, /orders, /measurements, etc.), serve index.html.
    """
    clean_path = resource.lstrip("/").replace("\\", "/")
    target_file = FRONTEND_DIST / clean_path

    # If it's a concrete file in frontend/dist, serve it directly
    if clean_path and target_file.is_file():
        mime_type, _ = mimetypes.guess_type(str(target_file))
        return FileResponse(open(target_file, "rb"), content_type=mime_type or "application/octet-stream")

    # Otherwise serve index.html for client-side routing
    index_file = FRONTEND_DIST / "index.html"
    if index_file.is_file():
        return HttpResponse(open(index_file, "r", encoding="utf-8").read(), content_type="text/html; charset=utf-8")

    return HttpResponse(
        "<h2>Frontend build not found. Please run: <code>npm run build</code> in the frontend folder.</h2>",
        status=404
    )

urlpatterns = [
    # REST API Endpoints
    path('api/', include('api.urls')),

    # Unified Frontend & SPA routing (Handles /, /assets/*, /customers, /orders, /measurements, etc.)
    re_path(r'^(?P<resource>.*)$', serve_spa, name='unified_frontend'),
]
