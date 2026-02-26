# ═══════════════════════════════════════════════════════════════════════════════
# AgriChain API - Production Dockerfile
# ═══════════════════════════════════════════════════════════════════════════════
#
# Multi-stage build for optimized production image
#
# Build: docker build -t agrichain-api .
# Run:   docker run -p 8000:8000 --env-file .env agrichain-api
# ═══════════════════════════════════════════════════════════════════════════════

# ─── Stage 1: Builder ─────────────────────────────────────────────────────────
FROM python:3.11-slim as builder

WORKDIR /build

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Create virtualenv
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt


# ─── Stage 2: Production ──────────────────────────────────────────────────────
FROM python:3.11-slim as production

WORKDIR /app

# Create non-root user for security
RUN groupadd --gid 1000 agrichain && \
    useradd --uid 1000 --gid agrichain --shell /bin/bash --create-home agrichain

# Copy virtualenv from builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Set Python environment
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONFAULTHANDLER=1

# Copy application code
COPY --chown=agrichain:agrichain . .

# Switch to non-root user
USER agrichain

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import httpx; httpx.get('http://localhost:8000/health').raise_for_status()"

# Default command - production server with gunicorn
CMD ["gunicorn", "main:app", \
     "--bind", "0.0.0.0:8000", \
     "--workers", "4", \
     "--worker-class", "uvicorn.workers.UvicornWorker", \
     "--timeout", "120", \
     "--keep-alive", "5", \
     "--access-logfile", "-", \
     "--error-logfile", "-"]
