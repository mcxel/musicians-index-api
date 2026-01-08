"""
BERNOUTSTUDIO AI - API SERVER
FastAPI REST API for video generation
"""

from fastapi import FastAPI, File, UploadFile, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from typing import Optional, Dict, Awaitable, Any
from enum import Enum
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware
import uvicorn
import asyncio
from pathlib import Path
import uuid
import json
from datetime import datetime
import logging
from contextlib import suppress
import os

# Optional imports with graceful fallback
try:
    import redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    redis = None

try:
    from video_generator import VideoGenerator, VideoConfig
    VIDEO_GENERATOR_AVAILABLE = True
except ImportError:
    VIDEO_GENERATOR_AVAILABLE = False
    VideoGenerator = None
    VideoConfig = None

try:
    import cv2
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False
    cv2 = None

try:
    import torch
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    torch = None

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================================================
# CONFIGURATION
# ============================================================================

class Settings:
    """Application settings"""
    API_VERSION = "2.0.0"
    API_TITLE = "BerntoutStudio AI API"
    API_DESCRIPTION = "Advanced AI Video Generation - Better Than Sora 2"
    
    # Paths
    UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "uploads"))
    OUTPUT_DIR = Path(os.getenv("OUTPUT_DIR", "outputs"))
    MODELS_DIR = Path(os.getenv("MODELS_DIR", "models"))
    
    # Redis
    ENABLE_REDIS = os.getenv("ENABLE_REDIS", "true").lower() == "true"
    REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
    REDIS_DB = int(os.getenv("REDIS_DB", "0"))
    
    # Generation limits
    MAX_DURATION = int(os.getenv("MAX_DURATION", "600"))  # 10 minutes
    MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE", str(500 * 1024 * 1024)))  # 500MB
    
    # Processing
    MAX_CONCURRENT_JOBS = int(os.getenv("MAX_CONCURRENT_JOBS", "4"))
    JOB_TIMEOUT = int(os.getenv("JOB_TIMEOUT", "3600"))  # 1 hour

    # Edge/CDN/hosting
    ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*")
    TRUSTED_HOSTS = os.getenv("TRUSTED_HOSTS", "*")
    BEHIND_PROXY = os.getenv("BEHIND_PROXY", "true").lower() == "true"
    FORWARDED_ALLOW_IPS = os.getenv("FORWARDED_ALLOW_IPS", "*")
    CACHE_MAX_AGE = int(os.getenv("CACHE_MAX_AGE", "604800"))  # seconds
    ALLOWED_AUDIO_EXTENSIONS = {".mp3", ".wav", ".flac", ".ogg", ".m4a"}

settings = Settings()

# Create directories
settings.UPLOAD_DIR.mkdir(exist_ok=True)
settings.OUTPUT_DIR.mkdir(exist_ok=True)
settings.MODELS_DIR.mkdir(exist_ok=True)

# Initialize Redis
redis_client = None
if REDIS_AVAILABLE and settings.ENABLE_REDIS:
    try:
        redis_client = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            db=settings.REDIS_DB,
            decode_responses=True
        )
    except Exception:
        redis_client = None

# In-memory fallback store when Redis is unavailable
local_job_store: Dict[str, Dict[str, Any]] = {}

# Concurrency control and in-flight tracking
semaphore = asyncio.Semaphore(settings.MAX_CONCURRENT_JOBS)
active_tasks: Dict[str, asyncio.Task] = {}

# ============================================================================
# DATA MODELS
# ============================================================================

class GenerationType(str, Enum):
    """Types of video generation"""
    TEXT = "text"
    AUDIO = "audio"
    MUSIC_VIDEO = "music_video"
    STORYBOARD = "storyboard"

class Resolution(str, Enum):
    """Video resolutions"""
    HD = "1920x1080"
    FULL_HD = "1920x1080"
    QHD = "2560x1440"
    UHD_4K = "3840x2160"
    UHD_8K = "7680x4320"

class GenerationRequest(BaseModel):
    """Request model for video generation"""
    type: GenerationType
    prompt: Optional[str] = Field(None, description="Text prompt for video")
    duration: float = Field(10.0, ge=0.1, le=600, description="Duration in seconds")
    resolution: Resolution = Resolution.UHD_4K
    fps: int = Field(60, ge=24, le=120, description="Frames per second")
    style: str = Field("cinematic", description="Visual style")
    seed: Optional[int] = Field(None, description="Random seed for reproducibility")
    
class MusicVideoRequest(BaseModel):
    """Request model for music video generation"""
    style: str = Field("performance", description="Music video style")
    artist_name: Optional[str] = None
    auto_scene_match: bool = Field(True, description="Auto-match scenes to music")
    lip_sync: bool = Field(True, description="Enable lip-sync for vocals")
    
class GenerationStatus(str, Enum):
    """Job status"""
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class JobResponse(BaseModel):
    """Response model for job creation"""
    job_id: str
    status: GenerationStatus
    message: str
    estimated_time: Optional[int] = None  # seconds
    
class JobStatusResponse(BaseModel):
    """Response model for job status"""
    job_id: str
    status: GenerationStatus
    progress: float  # 0-100
    current_step: Optional[str] = None
    video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    error: Optional[str] = None
    metadata: Optional[Dict] = None
    
class StatsResponse(BaseModel):
    """System statistics"""
    version: str
    total_jobs: int
    active_jobs: int
    completed_jobs: int
    failed_jobs: int
    avg_generation_time: float
    gpu_available: bool
    gpu_memory_used: Optional[float] = None
    gpu_memory_total: Optional[float] = None

# ============================================================================
# FASTAPI APP
# ============================================================================

app = FastAPI(
    title=settings.API_TITLE,
    description=settings.API_DESCRIPTION,
    version=settings.API_VERSION
)

# Hosting/proxy configuration for Cloudflare/GitHub frontends
allowed_origins = ["*"] if settings.ALLOWED_ORIGINS == "*" else [o.strip() for o in settings.ALLOWED_ORIGINS.split(",") if o.strip()]
if not allowed_origins:
    allowed_origins = ["*"]
allow_credentials = allowed_origins != ["*"]

trusted_hosts = ["*"] if settings.TRUSTED_HOSTS == "*" else [h.strip() for h in settings.TRUSTED_HOSTS.split(",") if h.strip()]
if not trusted_hosts:
    trusted_hosts = ["*"]

if settings.BEHIND_PROXY:
    app.add_middleware(ProxyHeadersMiddleware, trusted_hosts=trusted_hosts)

if trusted_hosts != ["*"]:
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=trusted_hosts)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize video generator (singleton)
video_generator = None


def ensure_generator_ready():
    """Ensure generator is initialized before handling a request."""
    if video_generator is None:
        raise HTTPException(status_code=503, detail="Video generator is initializing; please retry")


def safe_redis_ping() -> bool:
    """Check Redis availability without raising."""
    try:
        if redis_client is None:
            return False
        return bool(redis_client.ping())
    except (ConnectionError, OSError, AttributeError, TypeError):
        return False


def store_job_locally(job_id: str, job_data: Dict[str, Any]) -> None:
    """Persist job data in the in-memory fallback store."""
    local_job_store[job_id] = job_data


def read_job_locally(job_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve job data from the in-memory fallback store."""
    return local_job_store.get(job_id)

@app.on_event("startup")
async def startup_event():
    """Initialize video generator on startup"""
    global video_generator
    
    logger.info("Initializing BerntoutStudio AI Video Generator...")
    
    if VIDEO_GENERATOR_AVAILABLE and VideoConfig is not None:
        try:
            config = VideoConfig(
                resolution=(3840, 2160),  # 4K default
                fps=60,
                duration=10.0,
                style="cinematic"
            )
            video_generator = VideoGenerator(config)
            logger.info("Video generator ready!")
        except Exception as err:
            logger.warning("Video generator initialization failed: %s", str(err))
    else:
        logger.warning("Video generator not available")

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def create_job(job_type: str, params: Dict) -> str:
    """Create new generation job"""
    job_id = f"job_{uuid.uuid4().hex[:12]}"
    
    job_data = {
        "job_id": job_id,
        "type": job_type,
        "status": GenerationStatus.QUEUED.value,
        "progress": 0,
        "params": json.dumps(params),
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }
    
    # Store in Redis or fall back to local memory
    if redis_client is not None:
        try:
            redis_client.hset(f"job:{job_id}", mapping=job_data)
            redis_client.lpush("job_queue", job_id)
        except (ConnectionError, OSError, AttributeError, TypeError) as err:
            logger.warning("Redis unavailable, storing job in memory: %s", err)
            store_job_locally(job_id, job_data)
    else:
        store_job_locally(job_id, job_data)
    
    return job_id

def get_job_status(job_id: str) -> Optional[Dict]:
    """Get job status from Redis"""
    job_data: Optional[Dict[str, Any]] = None

    if redis_client is not None:
        try:
            job_data = redis_client.hgetall(f"job:{job_id}")
        except (ConnectionError, OSError, AttributeError, TypeError):
            logger.warning("Redis unavailable while fetching job %s; checking memory store", job_id)
            job_data = None

    if not job_data:
        job_data = read_job_locally(job_id)

    if not job_data:
        return None

    # Parse JSON fields
    if "params" in job_data and isinstance(job_data["params"], str):
        with suppress(json.JSONDecodeError):
            job_data["params"] = json.loads(job_data["params"])
    if "metadata" in job_data and isinstance(job_data["metadata"], str):
        with suppress(json.JSONDecodeError):
            job_data["metadata"] = json.loads(job_data["metadata"])
    
    return job_data

def update_job_status(job_id: str, status: str, progress: float = None, **kwargs):
    """Update job status"""
    updates = {
        "status": status,
        "updated_at": datetime.utcnow().isoformat()
    }
    
    if progress is not None:
        updates["progress"] = progress
    
    for key, value in kwargs.items():
        if isinstance(value, dict):
            updates[key] = json.dumps(value)
        else:
            updates[key] = value
    
    if redis_client is not None:
        try:
            redis_client.hset(f"job:{job_id}", mapping=updates)
        except (ConnectionError, OSError, AttributeError, TypeError) as err:
            logger.warning("Failed to update job status in Redis, keeping memory copy: %s", err)

    existing_local = read_job_locally(job_id) or {}
    merged = {**existing_local, **updates}
    store_job_locally(job_id, merged)


def register_job_task(job_id: str, coro: Awaitable):
    """Track a background job with cancellation, timeout, and concurrency limits."""

    async def runner():
        try:
            async with semaphore:
                await asyncio.wait_for(coro, timeout=settings.JOB_TIMEOUT)
        except asyncio.TimeoutError:
            logger.error(f"Job {job_id} timed out")
            update_job_status(job_id, GenerationStatus.FAILED.value, error="Job timed out")
        except asyncio.CancelledError:
            logger.info(f"Job {job_id} was cancelled")
            update_job_status(job_id, GenerationStatus.CANCELLED.value)
            raise
        except Exception as e:
            logger.error(f"Job {job_id} failed: {e}")
            update_job_status(job_id, GenerationStatus.FAILED.value, error=str(e))
        finally:
            active_tasks.pop(job_id, None)

    task = asyncio.create_task(runner())
    active_tasks[job_id] = task


def cancel_running_job(job_id: str) -> bool:
    """Cancel a running asyncio task if present."""
    task = active_tasks.get(job_id)
    if task and not task.done():
        task.cancel()
        return True
    return False

async def save_upload_file(upload_file: UploadFile, prefix: str = "") -> Path:
    """Save uploaded file to disk"""
    file_ext = Path(upload_file.filename).suffix
    file_path = settings.UPLOAD_DIR / f"{prefix}_{uuid.uuid4().hex[:8]}{file_ext}"
    
    with open(file_path, "wb") as f:
        content = await upload_file.read()
        f.write(content)
    
    return file_path


def validate_upload_size(upload_file: UploadFile):
    """Ensure uploaded file does not exceed configured size."""
    upload_file.file.seek(0, 2)
    size = upload_file.file.tell()
    upload_file.file.seek(0)

    if size > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Max allowed is {settings.MAX_FILE_SIZE // (1024*1024)}MB"
        )


def validate_audio_file(upload_file: UploadFile):
    """Validate audio extension before processing."""
    ext = Path(upload_file.filename).suffix.lower()
    if ext not in settings.ALLOWED_AUDIO_EXTENSIONS:
        allowed_list = ", ".join(sorted(settings.ALLOWED_AUDIO_EXTENSIONS))
        raise HTTPException(status_code=400, detail=f"Unsupported audio format. Allowed: {allowed_list}")


def cleanup_file(path: Path):
    """Remove a file if it exists; ignore errors."""
    with suppress(Exception):
        path.unlink(missing_ok=True)

# ============================================================================
# VIDEO GENERATION WORKERS
# ============================================================================

async def process_text_to_video(job_id: str, params: Dict):
    """Process text-to-video generation"""
    try:
        ensure_generator_ready()
        update_job_status(job_id, GenerationStatus.PROCESSING.value, progress=10, current_step="Initializing")
        
        # Extract parameters
        prompt = params.get("prompt")
        duration = params.get("duration", 10.0)
        style = params.get("style", "cinematic")
        
        update_job_status(job_id, GenerationStatus.PROCESSING.value, progress=30, current_step="Planning scenes")
        
        # Generate video
        frames = video_generator.generate_from_text(
            prompt=prompt,
            duration=duration,
            style=style
        )
        
        update_job_status(job_id, GenerationStatus.PROCESSING.value, progress=80, current_step="Rendering video")
        
        # Save video
        output_path = settings.OUTPUT_DIR / f"{job_id}.mp4"
        video_generator.save_video(frames, str(output_path))
        
        # Generate thumbnail
        if CV2_AVAILABLE and cv2 is not None:
            thumbnail_path = settings.OUTPUT_DIR / f"{job_id}_thumb.jpg"
            cv2.imwrite(str(thumbnail_path), cv2.cvtColor(frames[0], cv2.COLOR_RGB2BGR))
        
        # Update job with results
        update_job_status(
            job_id,
            GenerationStatus.COMPLETED.value,
            progress=100,
            current_step="Completed",
            video_url=f"/videos/{job_id}.mp4",
            thumbnail_url=f"/videos/{job_id}_thumb.jpg",
            metadata={
                "duration": duration,
                "num_frames": len(frames),
                "resolution": f"{frames.shape[2]}x{frames.shape[1]}",
                "style": style
            }
        )
        
        logger.info("Job %s completed successfully", job_id)
        
    except Exception as err:
        logger.error("Job %s failed: %s", job_id, str(err))
        update_job_status(
            job_id,
            GenerationStatus.FAILED.value,
            error=str(err)
        )

async def process_music_video(job_id: str, params: Dict, audio_path: Path):
    """Process music video generation"""
    try:
        ensure_generator_ready()
        update_job_status(job_id, GenerationStatus.PROCESSING.value, progress=10, current_step="Analyzing music")
        
        # Extract parameters
        style = params.get("style", "performance")
        artist_name = params.get("artist_name")
        
        artist_info = {"name": artist_name} if artist_name else None
        
        update_job_status(job_id, GenerationStatus.PROCESSING.value, progress=30, current_step="Planning scenes")
        
        # Generate music video
        frames = video_generator.generate_music_video(
            audio_path=str(audio_path),
            style=style,
            artist_info=artist_info
        )
        
        update_job_status(job_id, GenerationStatus.PROCESSING.value, progress=80, current_step="Rendering video")
        
        # Save video with audio
        output_path = settings.OUTPUT_DIR / f"{job_id}.mp4"
        video_generator.save_video(frames, str(output_path), audio_path=str(audio_path))
        
        # Generate thumbnail (with proper error handling)
        thumbnail_url = None
        if CV2_AVAILABLE and cv2 is not None:
            try:
                thumbnail_path = settings.OUTPUT_DIR / f"{job_id}_thumb.jpg"
                # Convert RGB to BGR for OpenCV
                thumbnail_frame = cv2.cvtColor(frames[0], cv2.COLOR_RGB2BGR)
                cv2.imwrite(str(thumbnail_path), thumbnail_frame)
                thumbnail_url = f"/videos/{job_id}_thumb.jpg"
            except Exception as e:
                logger.warning(f"Failed to generate thumbnail with cv2: {e}")
                thumbnail_url = None
        
        # Update job with results
        update_job_status(
            job_id,
            GenerationStatus.COMPLETED.value,
            progress=100,
            current_step="Completed",
            video_url=f"/videos/{job_id}.mp4",
            thumbnail_url=thumbnail_url,  # Use variable instead of hardcoded path
            metadata={
                "num_frames": len(frames),
                "resolution": f"{frames.shape[2]}x{frames.shape[1]}",
                "style": style
            }
        )
        
        logger.info("Music video job %s completed successfully", job_id)
        
    except Exception as err:
        logger.error("Music video job %s failed: %s", job_id, str(err))
        update_job_status(
            job_id,
            GenerationStatus.FAILED.value,
            error=str(err)
        )
    finally:
        cleanup_file(audio_path)

# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.get("/", tags=["General"])
async def root():
    """API root endpoint"""
    return {
        "name": settings.API_TITLE,
        "version": settings.API_VERSION,
        "description": settings.API_DESCRIPTION,
        "status": "operational",
        "docs": "/docs"
    }

@app.get("/health", tags=["General"])
async def health_check():
    """Health check endpoint"""
    gpu_available = False
    gpu_count = 0
    if TORCH_AVAILABLE and torch is not None:
        gpu_available = torch.cuda.is_available()
        gpu_count = torch.cuda.device_count() if gpu_available else 0
    
    return {
        "status": "healthy",
        "version": settings.API_VERSION,
        "gpu_available": gpu_available,
        "gpu_count": gpu_count,
        "redis_connected": safe_redis_ping(),
        "generator_ready": video_generator is not None
    }

@app.get("/healthz", tags=["General"])
async def healthz_check():
    """Kubernetes/Render health check endpoint"""
    return {"status": "ok"}

@app.get("/stats", response_model=StatsResponse, tags=["General"])
async def get_stats():
    """Get system statistics"""
    total_jobs = active_jobs = completed_jobs = failed_jobs = 0
    if safe_redis_ping() and redis_client is not None:
        try:
            job_keys = list(redis_client.keys("job:*"))
            total_jobs = len(job_keys)
            for key in job_keys:
                status = redis_client.hget(key, "status")
                if status == GenerationStatus.PROCESSING.value:
                    active_jobs += 1
                elif status == GenerationStatus.COMPLETED.value:
                    completed_jobs += 1
                elif status == GenerationStatus.FAILED.value:
                    failed_jobs += 1
        except (ConnectionError, OSError):
            logger.warning("Failed to read stats from Redis")
    
    # GPU stats
    gpu_memory_used = None
    gpu_memory_total = None
    gpu_available = False
    
    if TORCH_AVAILABLE and torch is not None:
        gpu_available = torch.cuda.is_available()
        if gpu_available:
            gpu_memory_used = torch.cuda.memory_allocated() / 1024**3  # GB
            gpu_memory_total = torch.cuda.get_device_properties(0).total_memory / 1024**3  # GB
    
    return StatsResponse(
        version=settings.API_VERSION,
        total_jobs=total_jobs,
        active_jobs=active_jobs,
        completed_jobs=completed_jobs,
        failed_jobs=failed_jobs,
        avg_generation_time=45.0,  # Placeholder
        gpu_available=gpu_available,
        gpu_memory_used=gpu_memory_used,
        gpu_memory_total=gpu_memory_total
    )

@app.post("/generate/text", response_model=JobResponse, tags=["Generation"])
async def generate_from_text(
    request: GenerationRequest
):
    """
    Generate video from text prompt
    
    Example:
    ```json
    {
        "type": "text",
        "prompt": "A beautiful sunset over the ocean with waves crashing",
        "duration": 10.0,
        "resolution": "3840x2160",
        "fps": 60,
        "style": "cinematic"
    }
    ```
    """
    if not request.prompt:
        raise HTTPException(status_code=400, detail="Prompt is required for text generation")
    
    ensure_generator_ready()

    # Create job
    job_id = create_job(
        job_type="text_to_video",
        params={
            "prompt": request.prompt,
            "duration": request.duration,
            "resolution": request.resolution.value,
            "fps": request.fps,
            "style": request.style,
            "seed": request.seed
        }
    )
    
    # Start processing in background with concurrency guard/timeout
    register_job_task(
        job_id,
        process_text_to_video(
            job_id=job_id,
            params={"prompt": request.prompt, "duration": request.duration, "style": request.style}
        )
    )
    
    return JobResponse(
        job_id=job_id,
        status=GenerationStatus.QUEUED,
        message="Video generation started",
        estimated_time=int(request.duration * 6)  # Rough estimate
    )

@app.post("/generate/music-video", response_model=JobResponse, tags=["Generation"])
async def generate_music_video(
    audio_file: UploadFile = File(...),
    style: str = "performance",
    artist_name: Optional[str] = None
):
    """
    Generate music video from audio file
    
    Upload an audio file (MP3, WAV, FLAC) and get a complete music video
    with scenes matched to the music structure.
    """
    ensure_generator_ready()
    validate_audio_file(audio_file)
    validate_upload_size(audio_file)

    # Save audio file
    audio_path = await save_upload_file(audio_file, prefix="audio")
    
    # Create job
    job_id = create_job(
        job_type="music_video",
        params={
            "audio_path": str(audio_path),
            "style": style,
            "artist_name": artist_name
        }
    )
    
    # Start processing in background with concurrency guard/timeout
    register_job_task(
        job_id,
        process_music_video(
            job_id=job_id,
            params={"style": style, "artist_name": artist_name},
            audio_path=audio_path
        )
    )
    
    return JobResponse(
        job_id=job_id,
        status=GenerationStatus.QUEUED,
        message="Music video generation started",
        estimated_time=180  # 3 minutes average
    )

@app.get("/jobs/{job_id}", response_model=JobStatusResponse, tags=["Jobs"])
async def get_job_status_endpoint(job_id: str):
    """Get status of a generation job"""
    job_data = get_job_status(job_id)
    
    if not job_data:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return JobStatusResponse(
        job_id=job_data["job_id"],
        status=job_data["status"],
        progress=float(job_data.get("progress", 0)),
        current_step=job_data.get("current_step"),
        video_url=job_data.get("video_url"),
        thumbnail_url=job_data.get("thumbnail_url"),
        error=job_data.get("error"),
        metadata=job_data.get("metadata")
    )

@app.get("/jobs/{job_id}/download", tags=["Jobs"])
async def download_video(job_id: str):
    """Download generated video"""
    job_data = get_job_status(job_id)
    
    if not job_data:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job_data["status"] != GenerationStatus.COMPLETED.value:
        raise HTTPException(status_code=400, detail="Video not ready yet")
    
    video_path = settings.OUTPUT_DIR / f"{job_id}.mp4"
    
    if not video_path.exists():
        raise HTTPException(status_code=404, detail="Video file not found")
    
    return FileResponse(
        path=video_path,
        media_type="video/mp4",
        filename=f"{job_id}.mp4"
    )

@app.get("/videos/{filename}", tags=["Videos"])
async def serve_video(filename: str):
    """Serve video file"""
    video_path = settings.OUTPUT_DIR / filename
    
    if not video_path.exists():
        raise HTTPException(status_code=404, detail="Video not found")
    
    # Determine media type
    if filename.endswith(".jpg") or filename.endswith(".jpeg"):
        media_type = "image/jpeg"
    elif filename.endswith(".png"):
        media_type = "image/png"
    else:
        media_type = "video/mp4"
    
    headers = None
    if settings.CACHE_MAX_AGE > 0:
        headers = {"Cache-Control": f"public, max-age={settings.CACHE_MAX_AGE}"}

    return FileResponse(path=video_path, media_type=media_type, headers=headers)

@app.delete("/jobs/{job_id}", tags=["Jobs"])
async def cancel_job(job_id: str):
    """Cancel a running job"""
    job_data = get_job_status(job_id)
    
    if not job_data:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job_data["status"] == GenerationStatus.COMPLETED.value:
        raise HTTPException(status_code=400, detail="Cannot cancel completed job")

    was_running = cancel_running_job(job_id)

    update_job_status(job_id, GenerationStatus.CANCELLED.value)
    
    return {
        "message": "Job cancelled successfully",
        "terminated_task": was_running
    }

# ============================================================================
# STARTUP DIAGNOSTICS
# ============================================================================

def print_startup_info():
    """Print startup information and diagnostics."""
    print("\n" + "="*80)
    print(f" {settings.API_TITLE} v{settings.API_VERSION}")
    print("="*80)
    print(f" Status: STARTING")
    print(f" Host: 0.0.0.0:8000")
    print(f" Docs: http://localhost:8000/docs")
    print(f" OpenAPI: http://localhost:8000/openapi.json")
    print("-"*80)
    print(" Configuration:")
    print(f"   Upload Dir: {settings.UPLOAD_DIR.absolute()}")
    print(f"   Output Dir: {settings.OUTPUT_DIR.absolute()}")
    print(f"   Models Dir: {settings.MODELS_DIR.absolute()}")
    print(f"   Max Concurrent Jobs: {settings.MAX_CONCURRENT_JOBS}")
    print(f"   Job Timeout: {settings.JOB_TIMEOUT}s")
    print(f"   Redis Enabled: {settings.ENABLE_REDIS}")
    print(f"   Redis Connected: {safe_redis_ping()}")
    print(f"   Behind Proxy: {settings.BEHIND_PROXY}")
    print("-"*80)
    print(" Available Generators:")
    print(f"   Video Generator: {'✓' if VIDEO_GENERATOR_AVAILABLE else '✗'}")
    print(f"   OpenCV (cv2): {'✓' if CV2_AVAILABLE else '✗'}")
    print(f"   PyTorch/GPU: {'✓' if TORCH_AVAILABLE else '✗'}")
    print(f"   Redis Client: {'✓' if REDIS_AVAILABLE else '✗'}")
    print("-"*80)
    print(" Press Ctrl+C to stop the server")
    print("="*80 + "\n")


# ============================================================================
# RUN SERVER
# ============================================================================

if __name__ == "__main__":
    print_startup_info()
    
    try:
        uvicorn.run(
            "api_server:app",
            host="0.0.0.0",
            port=8000,
            reload=False,  # Disable reload in production
            log_level="info",
            proxy_headers=settings.BEHIND_PROXY,
            forwarded_allow_ips=settings.FORWARDED_ALLOW_IPS,
            access_log=True,
            use_colors=True
        )
    except KeyboardInterrupt:
        logger.info("Server shutdown requested by user")
    except Exception as e:
        logger.error(f"Server error: {e}", exc_info=True)
        exit(1)
