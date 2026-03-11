# backend/api.py

import os
import datetime
import re
import traceback
import cloudinary
import cloudinary.uploader
from fastapi import FastAPI, BackgroundTasks
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from voice_service import generate_voice
from config import (
    GEMINI_API_KEY,
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
)

# --------------------------
# Celebrity Styles
# --------------------------
CELEBRITY_STYLES = {
    "modi": """
Speak in an energetic and motivational public speech style.
Use confident and inspiring language.
Explain the concept like addressing a large audience.
Use impactful sentences that encourage students to learn.
""",

    "salman": """
Speak in a casual, friendly and conversational tone.
Explain the concept like talking to friends.
Keep language simple and relaxed.
Make the explanation fun and engaging.
"""
}

# --------------------------
# Cloudinary Config
# --------------------------
cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET,
    secure=True,
)

# --------------------------
# FastAPI App
# --------------------------
app = FastAPI(title="AI Lesson Generator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------
# Gemini Client
# --------------------------
client = genai.Client(api_key=GEMINI_API_KEY)

# --------------------------
# Request Model
# --------------------------
class LessonRequest(BaseModel):
    course: str
    topic: str
    celebrity: str


# --------------------------
# Helpers
# --------------------------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def get_celebrity_video(celebrity_name: str):
    input_video_dir = os.path.join(BASE_DIR, "backend", "input")
    celebrity_video = os.path.join(input_video_dir, f"{celebrity_name.lower()}.mp4")

    if os.path.exists(celebrity_video):
        print(f"🎬 Using celebrity video: {celebrity_video}")
        return celebrity_video
    else:
        input_video = os.path.join(input_video_dir, "modi.mp4")
        print(f"🎬 Using default video: {input_video}")
        return input_video


# --------------------------
# Serve Files
# --------------------------
base_output_path = os.path.join(BASE_DIR, "outputs")
video_output_path = os.path.join(base_output_path, "video")
text_output_path = os.path.join(base_output_path, "text")

os.makedirs(video_output_path, exist_ok=True)
os.makedirs(text_output_path, exist_ok=True)

app.mount("/video-stream", StaticFiles(directory=video_output_path), name="video-stream")
app.mount("/transcript-stream", StaticFiles(directory=text_output_path), name="transcript-stream")


# --------------------------
# Root Route
# --------------------------
@app.get("/")
def home():
    return {"message": "AI Lesson Generator Backend Running"}


@app.get("/transcript/{filename}")
def get_transcript(filename: str):
    file_path = os.path.join(BASE_DIR, "outputs", "text", filename)

    if os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        return {"content": content}

    return {"error": "Transcript not found"}


@app.get("/status/{job_id}")
def get_status(job_id: str):
    status_data = job_status.get(job_id, {"status": "not_found"})

    if isinstance(status_data, str):
        return {"status": status_data}

    return status_data


# --------------------------
# Generate Lesson Endpoint
# --------------------------
job_status = {}


@app.post("/generate")
def generate_lesson(data: LessonRequest, background_tasks: BackgroundTasks):

    topic_clean = re.sub(r"[^\w\s-]", "", data.topic).strip().replace(" ", "_")
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")

    base_filename = f"{topic_clean}_{timestamp}"

    job_status[base_filename] = {"status": "processing"}

    background_tasks.add_task(process_lesson, data, base_filename)

    return {
        "status": "Processing",
        "filename": f"{base_filename}.mp4",
        "text_file": f"{base_filename}.txt",
        "audio_file": f"{base_filename}.mp3",
        "jobId": base_filename,
    }


# --------------------------
# Background Task Logic
# --------------------------
def process_lesson(data: LessonRequest, base_filename: str):

    try:
        print(f"\n🚀 Starting generation for: {data.topic} ({data.celebrity})")

        # Get celebrity style
        style = CELEBRITY_STYLES.get(
            data.celebrity.lower(),
            "Speak like a clear classroom teacher."
        )

        # 1️⃣ Generate Lesson Text
        prompt = f"""
Explain the topic '{data.topic}' from the subject '{data.course}'.

Instructions:
- Use simple English
- 45 to 60 words
- Clear explanation for students

Speaking Style:
{style}

Do not mention the celebrity name in the explanation.
"""

        try:
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
            )

            script = response.text.strip().replace("\n", " ")
            print(f"📝 Generated text: {script}")

        except Exception as e:
            print(f"❌ Gemini Error: {e}")
            return

        # 2️⃣ Create Output Folders
        base_output_dir = os.path.join(BASE_DIR, "outputs")

        text_dir = os.path.join(base_output_dir, "text")
        audio_dir = os.path.join(base_output_dir, "audio")
        video_dir = os.path.join(base_output_dir, "video")

        os.makedirs(text_dir, exist_ok=True)
        os.makedirs(audio_dir, exist_ok=True)
        os.makedirs(video_dir, exist_ok=True)

        text_path = os.path.join(text_dir, f"{base_filename}.txt")
        audio_path = os.path.join(audio_dir, f"{base_filename}.mp3")
        final_video = os.path.join(video_dir, f"{base_filename}.mp4")

        # 3️⃣ Save Script
        with open(text_path, "w", encoding="utf-8") as f:
            f.write(script)

        print(f"💾 Saved text to: {text_path}")

        # 4️⃣ Generate Voice using XTTS
        print("🎤 Generating AI voice...")

        generate_voice(script, audio_path, data.celebrity)

        print(f"✅ Audio generated: {audio_path}")

        # 5️⃣ Select Video
        input_video = get_celebrity_video(data.celebrity)

        if not os.path.exists(input_video):
            print(f"❌ Video file not found at {input_video}")
            return

        # 6️⃣ Merge Video + Audio
        ffmpeg_command = (
            f'ffmpeg -y -stream_loop -1 -i "{input_video}" '
            f'-i "{audio_path}" '
            f'-map 0:v:0 -map 1:a:0 '
            f'-c:v copy -c:a aac -shortest "{final_video}"'
        )

        print("🎥 Running ffmpeg...")

        os.system(ffmpeg_command)

        if not os.path.exists(final_video):
            print("❌ FFmpeg failed")
            job_status[base_filename] = {"status": "failed"}
            return

        # 7️⃣ Upload to Cloudinary
        cloudinary_url = None

        try:
            print("☁️ Uploading to Cloudinary...")

            upload_result = cloudinary.uploader.upload(
                final_video,
                resource_type="video",
                folder="ai_mentor/videos",
                public_id=base_filename,
                overwrite=True,
                chunk_size=6000000,
            )

            cloudinary_url = upload_result.get("secure_url")

            print(f"✅ Cloudinary upload success: {cloudinary_url}")

        except Exception as cloud_err:
            print(f"⚠️ Cloudinary upload failed: {cloud_err}")

        job_status[base_filename] = {
            "status": "ready",
            "cloudinary_url": cloudinary_url,
        }

        print("✅ Lesson ready!")

    except Exception as e:
        job_status[base_filename] = {"status": "failed"}

        print(f"❌ Error generating lesson: {e}")

        traceback.print_exc()