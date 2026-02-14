import { useState, useRef, useEffect } from "react";
import Header from "../components/Header";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAIVideo } from "../service/aiService";

import {
  ChevronLeft,
  Pause,
  Play,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  ChevronRight,
  ChevronDown,
  Check,
  Circle,
  FileText,
  CloudCog,
} from "lucide-react";

const getYouTubeVideoId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

export default function Learning() {
  const navigate = useNavigate();
  const { id: courseId } = useParams();
  const { user, updateUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [learningData, setLearningData] = useState(null);
  const [expandedModule, setExpandedModule] = useState("module-1");
  const [searchQuery, setSearchQuery] = useState("");
  const [celebritySearch, setCelebritySearch] = useState("");

  // Captions state
  const [captions, setCaptions] = useState([]);
  const [activeCaption, setActiveCaption] = useState("");
  const celebrities = ["Salman Khan", "Modi ji", "SRK"];

  // map celebrities to local videos and vtt files
  const celebrityVideoMap = {
    "Salman Khan": { video: "/vdo1.mp4", vtt: "/vdo1.vtt" },
    "Modi ji": { video: "/vdo2.mp4", vtt: "/vdo2.vtt" },
    SRK: { video: "/vdo1.mp4", vtt: "/vdo1.vtt" },
  };

  const [selectedCelebrity, setSelectedCelebrity] = useState(null);

  // When user requested single-word subtitles for the Reactjs paragraph,
  // we'll split into words and compute word-by-word cues when video duration is known.
  // const Reactjs_PARAGRAPH = `Reactjs is a high-level, object-oriented programming language that was originally developed by Sun Microsystems in 1995 and is now owned by Oracle Corporation. It is designed to be platform-independent, meaning that Reactjs code can run on any device that has a Reactjs Virtual Machine (JVM), making it highly versatile for developing cross-platform applications. Reactjs emphasizes object-oriented principles, such as encapsulation, inheritance and polymorphism, which allow developers to create modular, reusable and maintainable code. It has a strong memory management system, including automatic garbage collection, which reduces the likelihood of memory leaks.`;

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [aiVideoUrl, setAiVideoUrl] = useState(null);
  const [aiVttUrl, setAiVttUrl] = useState(null);
  const [isAIVideoLoading, setIsAIVideoLoading] = useState(false);

  const videoRef = useRef(null);
  const playerContainerRef = useRef(null);
  const { modules, currentLesson } = learningData || {};
  const allLessons = (modules || []).flatMap((module) => module.lessons || []);
  const currentLessonIndex = allLessons.findIndex(
    (lesson) => lesson.id === currentLesson?.id
  );

  useEffect(() => {
    // Check if user has purchased this course
    // const hasPurchased = user?.purchasedCourses?.some(course => course.courseId === parseInt(courseId));
    // if (!hasPurchased) {
    //   navigate('/courses');
    //   return;
    // }

    const fetchLearningData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/courses/${courseId}/learning`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const courseData = await response.json();
          console.log(courseData);
          setLearningData(courseData);
          // Load user's progress for this course
          const userProgress = user?.purchasedCourses?.find(
            (course) => course.courseId === parseInt(courseId)
          )?.progress;
          if (userProgress) {
            setExpandedModule(
              userProgress.currentLesson?.moduleTitle || "module-1"
            );
            // Set current lesson based on progress
            const currentLesson = userProgress.currentLesson;
            if (currentLesson) {
              // Find and set the current lesson
              const lesson = courseData.modules
                .flatMap((module) => module.lessons)
                .find((l) => l.id === currentLesson.lessonId);
              if (lesson) {
                setLearningData((prev) => ({
                  ...prev,
                  currentLesson: lesson,
                }));
              }
            }
          }
        } else {
          console.error(
            "Failed to fetch course learning data, using local fallback"
          );
          // Fallback local data so the learning page works without backend
          const fallback = {
            course: {
              id: parseInt(courseId),
            },
            modules: [
              {
                id: "module-1",
                title: "Module 1",
                lessons: [
                  {
                    id: 1,
                    title: "Introduction to Reactjs",
                    type: "video",
                    duration: "0:10",
                    videoUrl: "/vdo1.mp4",
                    content: {
                      introduction:
                        "Reactjs is a high-level, object-oriented programming language that was originally developed by Sun Microsystems in 1995 and is now owned by Oracle Corporation. It is designed to be platform-independent, meaning that Reactjs code can run on any device that has a Reactjs Virtual Machine (JVM), making it highly versatile for developing cross-platform applications. Reactjs emphasizes object-oriented principles, such as encapsulation, inheritance and polymorphism, which allow developers to create modular, reusable and maintainable code. It has a strong memory management system, including automatic garbage collection, which reduces the likelihood of memory leaks.",
                      keyConcepts: [],
                    },
                  },
                  {
                    id: 2,
                    title: "Reactjs: Advanced Concepts",
                    type: "video",
                    duration: "0:12",
                    videoUrl: "/vdo2.mp4",
                    content: {
                      introduction:
                        "Continuation video for Reactjs advanced concepts.",
                      keyConcepts: [],
                    },
                  },
                ],
              },
            ],
            currentLesson: {
              id: 1,
            },
          };

          // If we have user progress, try to set the exact lesson from fallback
          const userProgress = user?.purchasedCourses?.find(
            (course) => course.courseId === parseInt(courseId)
          )?.progress;
          if (userProgress && userProgress.currentLesson) {
            const lesson = fallback.modules
              .flatMap((m) => m.lessons)
              .find((l) => l.id === userProgress.currentLesson.lessonId);
            if (lesson) {
              setLearningData({ ...fallback, currentLesson: lesson });
            } else {
              setLearningData(fallback);
            }
          } else {
            setLearningData(fallback);
          }
        }
      } catch (error) {
        console.error(
          "Error fetching learning data, using local fallback:",
          error
        );
        const fallback = {
          course: {
            id: parseInt(courseId),
            title: "Local Demo Course",
          },
          modules: [
            {
              id: "module-1",
              title: "Module 1",
              lessons: [
                {
                  id: 1,
                  title: "Introduction to Reactjs",
                  type: "video",
                  duration: "0:10",
                  videoUrl: "/vdo1.mp4",
                  content: {
                    introduction:
                      "Reactjs is a high-level, object-oriented programming language that was originally developed by Sun Microsystems in 1995 and is now owned by Oracle Corporation. It is designed to be platform-independent, meaning that Reactjs code can run on any device that has a Reactjs Virtual Machine (JVM), making it highly versatile for developing cross-platform applications. Reactjs emphasizes object-oriented principles, such as encapsulation, inheritance and polymorphism, which allow developers to create modular, reusable and maintainable code. It has a strong memory management system, including automatic garbage collection, which reduces the likelihood of memory leaks.",
                    keyConcepts: [],
                  },
                },
                {
                  id: 2,
                  title: "Reactjs: Advanced Concepts",
                  type: "video",
                  duration: "0:12",
                  videoUrl: "/vdo2.mp4",
                  content: {
                    introduction:
                      "Continuation video for Reactjs advanced concepts.",
                    keyConcepts: [],
                  },
                },
              ],
            },
          ],
          currentLesson: {
            id: 1,
          },
        };

        // If we have user progress, try to set the exact lesson from fallback
        const userProgress = user?.purchasedCourses?.find(
          (course) => course.courseId === parseInt(courseId)
        )?.progress;
        if (userProgress && userProgress.currentLesson) {
          const lesson = fallback.modules
            .flatMap((m) => m.lessons)
            .find((l) => l.id === userProgress.currentLesson.lessonId);
          if (lesson) {
            setLearningData({ ...fallback, currentLesson: lesson });
          } else {
            setLearningData(fallback);
          }
        } else {
          setLearningData(fallback);
        }
      }
    };
    fetchLearningData();
  }, [courseId, user, navigate]);

  // Load and parse VTT captions (simple parser) when selectedCelebrity changes
  useEffect(() => {
    const loadCaptions = async () => {
      try {
        const vttPath =
          aiVttUrl || 
          (selectedCelebrity &&
            celebrityVideoMap[selectedCelebrity] &&
            celebrityVideoMap[selectedCelebrity].vtt) ||
          "/vdo_subtitles.vtt";
        const res = await fetch(vttPath);
        if (!res.ok) {
          setCaptions([]);
          return;
        }
        const text = await res.text();
        const blocks = text.replace(/\r\n/g, "\n").split(/\n\n+/).slice(1); // skip WEBVTT header
        const cues = blocks
          .map((block) => {
            const lines = block
              .split("\n")
              .map((l) => l.trim())
              .filter(Boolean);
            if (lines.length < 2) return null;
            const timeLine = lines[0];
            const textLines = lines.slice(1).join(" ");
            const match = timeLine.match(
              /(\d{2}:\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}\.\d{3})/
            );
            if (!match) return null;
            const toSeconds = (s) => {
              const [hh, mm, rest] = s.split(":");
              const [ss, ms] = rest.split(".");
              return (
                parseInt(hh) * 3600 +
                parseInt(mm) * 60 +
                parseInt(ss) +
                parseFloat("0." + ms)
              );
            };
            return {
              start: toSeconds(match[1]),
              end: toSeconds(match[2]),
              text: textLines,
            };
          })
          .filter(Boolean);
        setCaptions(cues);
      } catch (err) {
        console.warn("Could not load captions:", err);
        setCaptions([]);
      }
    };

    loadCaptions();
  }, [selectedCelebrity, aiVttUrl]);

  // Ensure when currentLesson changes we load its video into the player
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !learningData?.currentLesson) return;

    const loadVideo = async () => {
      if (selectedCelebrity) {
        setIsAIVideoLoading(true);
        try {
          const payload = {
            celebrity: selectedCelebrity.split(" ")[0].toLowerCase(),
            course: learningData?.course?.title || learningData?.modules?.[0]?.title || "React JS",
            topic: learningData.currentLesson.title || learningData?.modules?.[0]?.lessons?.[0]?.title || "Welcome to the lesson"
          };
          const data = await getAIVideo(payload);
          if (data && data.videoUrl) {
            setAiVideoUrl(data.videoUrl);
            if (data.vttUrl) {
              setAiVttUrl(data.vttUrl);
            }
            v.pause();
            v.src = data.videoUrl;
            v.load();
            const p = v.play();
            if (p && typeof p.then === "function") {
              p.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
            } else {
              setIsPlaying(true);
            }
          }
        } catch (error) {
          console.error("Error generating AI video on lesson change:", error);
          const src =
            celebrityVideoMap[selectedCelebrity]?.video ||
            learningData.currentLesson.videoUrl;
          if (src) {
            v.pause();
            v.src = src;
            v.load();
            const p = v.play();
            if (p && typeof p.then === "function") {
              p.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
            } else {
              setIsPlaying(true);
            }
          }
        } finally {
          setIsAIVideoLoading(false);
        }
      } else {
        setIsAIVideoLoading(false);
        const src = learningData.currentLesson.videoUrl;
        if (src) {
          v.pause();
          v.src = src;
          v.load();
          setIsPlaying(false); // Lessons don't autoplay by default unless celebrity is selected
        }
      }
    };

    loadVideo();
  }, [learningData?.currentLesson, selectedCelebrity]);

  // If selectedCelebrity is Salman Khan and the user wants the Reactjs paragraph
  // shown word-by-word, create per-word cues when video metadata (duration) is available.
  // useEffect(() => {
  //   const v = videoRef.current;
  //   if (!v) return;

  //   const createWordCues = () => {
  //     if (selectedCelebrity !== "Salman Khan") return;
  //     const words = Reactjs_PARAGRAPH.split(/\s+/).filter(Boolean);
  //     if (
  //       !words.length ||
  //       !v.duration ||
  //       !isFinite(v.duration) ||
  //       v.duration <= 0
  //     )
  //       return;
  //     const per = v.duration / words.length;
  //     const cues = words.map((w, i) => ({
  //       start: i * per,
  //       end: (i + 1) * per,
  //       text: w,
  //     }));
  //     setCaptions(cues);
  //   };

  //   // If metadata already loaded, create cues immediately
  //   if (v.duration && isFinite(v.duration) && v.duration > 0) {
  //     createWordCues();
  //   }

  //   v.addEventListener("loadedmetadata", createWordCues);
  //   return () => v.removeEventListener("loadedmetadata", createWordCues);
  // }, [selectedCelebrity, videoRef.current]);


  if (!learningData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const completeLesson = async (lessonId) => {
    // Check if lesson is already completed
    const courseProgress = user?.purchasedCourses?.find(
      (course) => course.courseId === parseInt(courseId)
    )?.progress;
    const isAlreadyCompleted = courseProgress?.completedLessons?.some(
      (cl) => cl.lessonId === lessonId
    );

    if (isAlreadyCompleted) {
      console.log("Lesson already completed, skipping");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await fetch("/api/users/course-progress", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseId: parseInt(courseId),
          completedLesson: { lessonId },
        }),
      });
    } catch (error) {
      console.error("Error marking lesson completed:", error);
    }

    // Also update current lesson pointer
    try {
      const token = localStorage.getItem("token");
      await fetch("/api/users/course-progress", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseId: parseInt(courseId),
          currentLesson: {
            lessonId,
            moduleTitle: expandedModule,
          },
        }),
      });
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  const toggleModule = (id) => {
    setExpandedModule((prev) => (prev === id ? null : id));
  };

  const handleLessonClick = (lesson) => {
    // update current lesson locally and let useEffect handle video loading
    setLearningData((prev) => ({ ...prev, currentLesson: lesson }));
  };

  const handlePrevious = () => {
    if (currentLessonIndex > 0) {
      const prevLesson = allLessons[currentLessonIndex - 1];
      handleLessonClick(prevLesson);
    }
  };

  const handleNext = async () => {
    if (currentLessonIndex >= allLessons.length - 1) return;
    setIsNavigating(true);
    // mark current as completed
    if (currentLesson?.id) await completeLesson(currentLesson.id);
    const nextLesson = allLessons[currentLessonIndex + 1];
    handleLessonClick(nextLesson);
    setIsNavigating(false);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        const p = videoRef.current.play();
        if (p && typeof p.then === "function") {
          p.then(() => setIsPlaying(true)).catch((err) => {
            console.warn("Play was blocked:", err);
            setIsPlaying(false);
          });
        } else {
          setIsPlaying(true);
        }
      }
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      if (!isMuted && volume === 0) {
        setVolume(0.5);
        videoRef.current.volume = 0.5;
      }
    }
  };

  const handleProgress = () => {
    if (videoRef.current) {
      const duration = videoRef.current.duration;
      const currentTime = videoRef.current.currentTime;
      setDuration(duration);
      setCurrentTime(currentTime);
      setProgress((currentTime / duration) * 100);
      // update visible caption overlay
      if (captions.length > 0) {
        const cue = captions.find(
          (c) => currentTime >= c.start && currentTime <= c.end
        );
        setActiveCaption(cue ? cue.text : "");
      }
    }
  };

  const handleSeek = (e) => {
    if (videoRef.current) {
      const rect = e.target.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      const newTime = percentage * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      setProgress(percentage * 100);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerContainerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Top Breadcrumb Header - Matching Image */}
      <div className="mt-16 bg-white border-b border-gray-200 px-8 py-3 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-gray-500 overflow-hidden">
          <button onClick={() => navigate("/courses")} className="hover:text-gray-900 transition-colors shrink-0">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
          </button>
          <ChevronRight className="w-4 h-4 shrink-0" />
          <span className="hover:text-gray-900 cursor-pointer truncate">{learningData?.course?.title || "Course"}</span>
          <ChevronRight className="w-4 h-4 shrink-0" />
          <span className="hover:text-gray-900 cursor-pointer truncate">{expandedModule || "Module"}</span>
          <ChevronRight className="w-4 h-4 shrink-0" />
          <span className="text-gray-900 font-medium truncate">{currentLesson?.title}</span>
        </div>
      </div>


      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Sub-header with Dropdown */}
        <div className="px-8 py-3 flex items-center justify-between bg-white">
          <div className="relative group">
            <div className="text-[10px] text-gray-500 absolute -top-2 left-3 bg-white px-1 z-10 uppercase tracking-wider font-bold">Contents</div>
                <select 
                  value={currentLesson?.id}
                  onChange={(e) => {
                    const selectedId = String(e.target.value);
                    const lesson = allLessons.find(l => String(l.id) === selectedId);
                    if (lesson) handleLessonClick(lesson);
                  }}
                  className="appearance-none bg-white border border-gray-300 rounded-sm pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-[320px] cursor-pointer"
                >
                  {modules?.map(module => (
                    <optgroup key={module.id} label={module.title}>
                      {module.lessons.map(lesson => (
                        <option key={lesson.id} value={lesson.id}>{lesson.title}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
            <ChevronDown className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="flex items-center gap-4">
             {/* Celebrity Toggle as buttons instead of sidebar */}
             <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200">
               {celebrities.map(c => (
                 <button
                   key={c}
                   onClick={() => setSelectedCelebrity(selectedCelebrity === c ? null : c)}
                   className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                     selectedCelebrity === c 
                     ? "bg-white text-blue-600 shadow-sm" 
                     : "text-gray-600 hover:text-gray-900"
                   }`}
                 >
                   {c}
                 </button>
               ))}
             </div>
          </div>
        </div>

        <main className="flex-1 flex overflow-hidden w-full">
          {/* Main Video Section */}
          <div className="w-[55%] shrink-0 flex flex-col p-8 pt-0 overflow-y-auto custom-scrollbar">
            <div
              ref={playerContainerRef}
              className="relative bg-black rounded-lg overflow-hidden shadow-lg group w-full"
              style={{ aspectRatio: "16/9" }}
            >
              {isAIVideoLoading && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-white text-sm font-medium">Generating AI Video...</p>
                </div>
              )}
              {currentLesson?.youtubeUrl ? (
                <iframe
                  key={currentLesson.id}
                  src={`https://www.youtube.com/embed/${getYouTubeVideoId(
                    currentLesson.youtubeUrl
                  )}?autoplay=0&rel=0`}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={currentLesson.title}
                ></iframe>
              ) : (
                <video
                  ref={videoRef}
                  src={
                    aiVideoUrl ||
                    (selectedCelebrity &&
                      celebrityVideoMap[selectedCelebrity] &&
                      celebrityVideoMap[selectedCelebrity].video) ||
                    currentLesson?.videoUrl
                  }
                  className="w-full h-full object-contain"
                  onTimeUpdate={handleProgress}
                  onLoadedMetadata={handleProgress}
                  onEnded={() => setIsPlaying(false)}
                  controls
                  playsInline
                  preload="metadata"
                />
              )}

              {/* Over-video Controls */}
              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 via-black/40 to-transparent p-4 transition-opacity duration-300 opacity-0 group-hover:opacity-100 z-20">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-gray-300 font-mono w-10 text-right">{formatTime(currentTime)}</span>
                    <div className="flex-1 bg-white/20 h-1.5 rounded-full relative group/progress cursor-pointer" onClick={handleSeek}>
                      <div 
                        className="absolute h-full bg-red-500 rounded-full transition-all duration-100"
                        style={{ width: `${progress}%` }}
                      >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg scale-0 group-hover/progress:scale-100 transition-transform" />
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-300 font-mono w-10">{formatTime(duration)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button onClick={togglePlay} className="text-white hover:text-blue-400 transition-colors">
                        {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                      </button>
                      <div className="flex items-center gap-2 group/volume">
                        <button onClick={toggleMute} className="text-white hover:text-blue-400 transition-colors">
                          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        </button>
                        <input
                          type="range" min="0" max="1" step="0.01" value={volume}
                          onChange={handleVolumeChange}
                          className="w-0 group-hover/volume:w-20 transition-all duration-300 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-white"
                        />
                      </div>
                    </div>
                    <button onClick={toggleFullscreen} className="text-white hover:text-blue-400 transition-colors uppercase text-sm font-bold tracking-widest px-4">
                      Full view
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Text explanation below video as content */}
            <div className="mt-8 prose prose-slate">
              {selectedCelebrity && (
                <div className="mt-6 p-6 bg-blue-50 border-l-4 border-blue-500 rounded-r-xl">
                  <p className="text-blue-800 font-medium italic">"Currently learning with {selectedCelebrity} avatar. The explanation has been tailored for natural speech speed."</p>
                </div>
              )}
            </div>
          </div>

          {/* Transcript Panel on Right - Specific highlight like image */}
          <div className="flex-1 min-w-0 bg-white border-l border-gray-200 flex flex-col h-full overflow-hidden">
            <div className="px-6 py-1 border-b border-gray-100 flex items-center justify-between">
              Transcript
            </div>
            
            <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar space-y-1">
              {captions.length > 0 ? (
                captions.map((cue, idx) => {
                  const isActive = currentTime >= cue.start && currentTime <= cue.end;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        if (videoRef.current) {
                          videoRef.current.currentTime = cue.start;
                          videoRef.current.play().catch(() => {});
                        }
                      }}
                      className={`w-full text-left p-4 pr-6 rounded-sm transition-all duration-200 flex gap-6 group/transcript ${
                        isActive
                          ? "bg-[#F0F2F4] border-l-4 border-[#1A73E8]"
                          : "bg-white border-l-4 border-transparent hover:bg-gray-50 hover:border-gray-200"
                      }`}
                    >
                      <span className={`text-xs font-mono font-medium shrink-0 mt-1 ${
                        isActive ? "text-[#1A73E8]" : "text-gray-500"
                      }`}>
                        {formatTime(cue.start)}
                      </span>
                      <p className={`text-[15px] leading-relaxed flex-1 ${
                        isActive ? "text-gray-900 font-medium" : "text-gray-700"
                      }`}>
                        {cue.text}
                      </p>
                    </button>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-20 text-gray-400">
                  <CloudCog className="w-12 h-12 mb-3 animate-pulse" />
                  <p className="text-sm font-medium">Auto-generating transcript...</p>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Action Bar Bottom - Fixed to bottom of screen style */}
        <div className="bg-white border-t border-gray-200 px-8 py-2 flex items-center justify-between z-30">
          <button
            onClick={handlePrevious}
            disabled={currentLessonIndex <= 0}
            className="flex items-center gap-2 px-[14px] py-[8px] bg-[#1A73E8] text-white font-semibold rounded hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>
          
          <div className="flex-1 flex justify-center text-sm font-medium text-gray-500">
            {currentLessonIndex + 1} of {allLessons.length} lessons
          </div>

          <button
            onClick={handleNext}
            disabled={currentLessonIndex >= allLessons.length - 1 || isNavigating}
            className="flex items-center gap-2 px-[14px] py-[8px] bg-[#1A73E8] text-white font-semibold rounded hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            {isNavigating ? "Loading..." : "Next"}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
