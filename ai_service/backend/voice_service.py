import os
from TTS.api import TTS

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

tts_model = None

def load_model():
    global tts_model

    if tts_model is None:
        print("Loading XTTS voice model...")
        tts_model = TTS(
            model_name="tts_models/multilingual/multi-dataset/xtts_v2",
            gpu=False
        )
        print("XTTS model loaded")


def generate_voice(text, audio_path, celebrity="modi"):

    load_model()

    voice_file = os.path.join(BASE_DIR, "voices", f"{celebrity}.wav")

    if not os.path.exists(voice_file):
        raise FileNotFoundError(f"Voice sample not found: {voice_file}")

    print("Generating voice...")

    tts_model.tts_to_file(
        text=text,
        speaker_wav=voice_file,
        language="en",
        file_path=audio_path
    )

    print(f"Voice generated: {audio_path}")