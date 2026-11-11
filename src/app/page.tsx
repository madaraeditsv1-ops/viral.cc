"use client";

import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clapperboard,
  Clock3,
  Copy,
  Download,
  FileVideo2,
  Film,
  FolderOpen,
  Gauge,
  Hash,
  Heart,
  LayoutDashboard,
  Lightbulb,
  LoaderCircle,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Upload,
  Video,
  WandSparkles,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type Dispatch, type SetStateAction } from "react";
import type { Input as MediaInput } from "mediabunny";

type VideoInfo = {
  name: string;
  size: number;
  type: string;
  duration: number;
  width: number;
  height: number;
  url: string;
  file: File;
};

type OptimizedVideo = {
  name: string;
  size: number;
  url: string;
};

type VideoQuality = "high" | "balanced" | "compact";

type SavedClip = {
  id: string;
  name: string;
  addedAt: string;
  category: string;
  status: string;
  size: number;
  width: number;
  height: number;
  duration: number;
};

type Post = {
  id: string;
  title: string;
  date: string;
  time: string;
  status: "Draft" | "Scheduled" | "Published";
};

type AnalyticsRow = {
  id: string;
  date: string;
  postTime?: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
};

type ExportPreset = {
  name: string;
  category: string;
  resolution: string;
  fps: number;
  bitrate: string;
  codec: string;
  format: string;
  audioBitrate: string;
  audioSampleRate: string;
  color: string;
  profile: string;
  keyframeInterval: string;
};

type NavigationItem = {
  label: string;
  icon: LucideIcon;
};

type CreatorAccount = {
  id: string;
  email: string;
  username: string | null;
  image: string | null;
  role: "CREATOR" | "ADMIN";
};

const navigation: { label: string; items: NavigationItem[] }[] = [
  {
    label: "OPTIMIZE",
    items: [
      { label: "Optimize video", icon: Upload },
      { label: "Overview", icon: LayoutDashboard },
    ],
  },
  {
    label: "VIDEO TOOLS",
    items: [
      { label: "Export Settings", icon: SlidersHorizontal },
      { label: "Upload Methods", icon: Clapperboard },
    ],
  },
  {
    label: "GROW",
    items: [
      { label: "Posting Schedule", icon: Clock3 },
      { label: "Caption Generator", icon: WandSparkles },
      { label: "Hashtag Research", icon: Hash },
      { label: "Content Calendar", icon: CalendarDays },
      { label: "Analytics", icon: BarChart3 },
      { label: "Growth Tracker", icon: ArrowUpRight },
      { label: "Best Posting Times", icon: Activity },
    ],
  },
  {
    label: "LIBRARY",
    items: [{ label: "Video Library", icon: FolderOpen }],
  },
];

const categories = [
  "Anime & animation",
  "AMV edits",
  "Manga edits",
  "Cartoon edits",
  "Character edits",
  "Celebrity edits",
  "Actor & movie edits",
  "TV & series edits",
  "Football & soccer edits",
  "Basketball edits",
  "UFC & boxing edits",
  "Athlete edits",
  "Gaming",
  "Fortnite edits",
  "Roblox edits",
  "Minecraft edits",
  "FPS edits",
  "Gaming cinematics",
  "Phonk edits",
  "Velocity edits",
  "Lyric edits",
  "Music & aesthetic",
  "Sad & romantic edits",
  "Cinematic",
  "3D edits",
  "Heavy VFX",
  "Motion graphics",
  "Transition edits",
  "Typography edits",
  "Slow-motion edits",
  "Color grading",
  "Glow edits",
  "Shake edits",
  "Masking & compositing",
  "Car edits",
  "Motorcycle edits",
  "Fashion edits",
  "Photography edits",
  "Travel edits",
  "Lifestyle edits",
  "Nature edits",
  "High-detail edits",
  "General TikTok content",
  "Custom",
];
const defaultCategory = "General TikTok content";
const editingSoftwareOptions = ["After Effects", "Premiere Pro", "CapCut PC", "CapCut Mobile", "DaVinci Resolve", "Final Cut Pro", "Other"];
const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const defaultPresets: ExportPreset[] = [
  { name: "General TikTok", category: "All categories", resolution: "1080 × 1920", fps: 30, bitrate: "12 Mbps", codec: "H.264", format: "MP4", audioBitrate: "320 kbps", audioSampleRate: "48 kHz", color: "Rec.709", profile: "High", keyframeInterval: "2 sec" },
  { name: "High-motion edit", category: "Sports, gaming, velocity", resolution: "1080 × 1920", fps: 60, bitrate: "20 Mbps", codec: "H.264", format: "MP4", audioBitrate: "320 kbps", audioSampleRate: "48 kHz", color: "Rec.709", profile: "High", keyframeInterval: "2 sec" },
  { name: "Cinematic detail", category: "Cinematic, 3D, VFX", resolution: "1080 × 1920", fps: 30, bitrate: "16 Mbps", codec: "H.265", format: "MP4", audioBitrate: "320 kbps", audioSampleRate: "48 kHz", color: "Rec.709", profile: "Main", keyframeInterval: "2 sec" },
  { name: "Animation & AMV", category: "Anime, animation, character edits", resolution: "1080 × 1920", fps: 60, bitrate: "18 Mbps", codec: "H.264", format: "MP4", audioBitrate: "320 kbps", audioSampleRate: "48 kHz", color: "Rec.709", profile: "High", keyframeInterval: "2 sec" },
];

const guides = [
  {
    title: "TikTok mobile",
    detail: "Transfer the finished file to your device, then select it from the in-app upload flow.",
    steps: ["Export a vertical 9:16 master from your editor.", "Transfer the original file without sending it through a messenger.", "In TikTok, tap + → Upload and choose the original video.", "Review the preview for framing, sound, and color before publishing."],
  },
  {
    title: "TikTok Studio / desktop",
    detail: "Use TikTok's official web upload experience when it is available for your account.",
    steps: ["Open TikTok Studio or the official upload page.", "Select your master export and wait for processing to finish.", "Review the cover, caption, audience, and disclosure settings.", "Confirm the post appears in your account before marking it published."],
  },
  {
    title: "Preserve visual quality",
    detail: "Keep one clean master and avoid unnecessary transcodes between your editor and TikTok.",
    steps: ["Export once from the source project using a supported format.", "Keep the original frame size and frame rate unless you have a reason to change them.", "Avoid re-saving through chat or social apps before uploading.", "Compare a downloaded post with your master to identify platform-side changes."],
  },
];

const hashtagGroups: Record<string, string[]> = {
  "Anime & animation": ["#animeedit", "#amv", "#animeamv", "#animeeditor", "#animetok"],
  "AMV edits": ["#amv", "#amvedit", "#animeamv", "#amvcreator", "#editingtok"],
  "Manga edits": ["#mangaedit", "#manga", "#mangatok", "#mangaeditor", "#panels"],
  "Cartoon edits": ["#cartoonedit", "#animationedit", "#cartoontok", "#characteredit", "#fanedit"],
  "Character edits": ["#characteredit", "#edit", "#fanedit", "#transitionedit", "#editingtok"],
  "Celebrity edits": ["#celebrityedit", "#fanedit", "#celebritytok", "#edit", "#creatorcommunity"],
  "Actor & movie edits": ["#movieedit", "#actoredit", "#filmedit", "#fanedit", "#cinematicedit"],
  "TV & series edits": ["#seriesedit", "#tvshowedit", "#fanedit", "#characteredit", "#editingtok"],
  "Football & soccer edits": ["#footballedit", "#socceredit", "#footballtiktok", "#sportsedit", "#matchday"],
  "Basketball edits": ["#basketballedit", "#hoopmixtape", "#basketballtiktok", "#sportsedit", "#ballislife"],
  "UFC & boxing edits": ["#ufcedit", "#boxingedit", "#fightedit", "#combatsports", "#sportsedit"],
  "Athlete edits": ["#athleteedit", "#sportsedit", "#sportstiktok", "#trainingedit", "#highlightreel"],
  Gaming: ["#gamingedit", "#gameplayedit", "#gamingmontage", "#fpsedit", "#gamingcreator"],
  "Fortnite edits": ["#fortniteedit", "#fortnitemontage", "#gamingedit", "#fortniteclips", "#gamingcreator"],
  "Roblox edits": ["#robloxedit", "#robloxmontage", "#robloxcreator", "#gamingedit", "#robloxtiktok"],
  "Minecraft edits": ["#minecraftedit", "#minecraftbuilds", "#minecraftcreator", "#gamingedit", "#minecrafttok"],
  "FPS edits": ["#fpsedit", "#gamingmontage", "#gameplayedit", "#gamingcreator", "#highlights"],
  "Gaming cinematics": ["#gamingcinematic", "#gamecinematics", "#gamingedit", "#cinematicedit", "#gameplayedit"],
  "Phonk edits": ["#phonkedit", "#phonk", "#velocityedit", "#musicedit", "#editingtok"],
  "Velocity edits": ["#velocityedit", "#velocity", "#smoothtransitions", "#editingtok", "#musicedit"],
  "Lyric edits": ["#lyricedit", "#lyricsvideo", "#musicedit", "#typographyedit", "#editingtok"],
  "Music & aesthetic": ["#velocityedit", "#phonkedit", "#aestheticedit", "#lyricedit", "#musicedit"],
  "Sad & romantic edits": ["#sadedit", "#romanticedits", "#aestheticedit", "#musicedit", "#emotionaledit"],
  Cinematic: ["#cinematicedit", "#colorgrading", "#filmmaking", "#visualstorytelling", "#cinematic"],
  "3D edits": ["#3dedit", "#3dart", "#motiondesign", "#cgiart", "#visualeffects"],
  "Heavy VFX": ["#vfxedit", "#visualeffects", "#compositing", "#aftereffects", "#motiondesign"],
  "Motion graphics": ["#motiongraphics", "#motiondesign", "#typographyanimation", "#aftereffects", "#designprocess"],
  "Transition edits": ["#transitionedit", "#smoothtransitions", "#editingtutorial", "#editingtok", "#aftereffects"],
  "Typography edits": ["#typographyedit", "#kinetictype", "#motiongraphics", "#typeanimation", "#designprocess"],
  "Slow-motion edits": ["#slowmotionedit", "#slowmo", "#cinematicedit", "#filmmaking", "#smoothmotion"],
  "Color grading": ["#colorgrading", "#colorgrade", "#cinematiclook", "#filmmaking", "#postproduction"],
  "Glow edits": ["#glowedit", "#gloweffect", "#vfxedit", "#aftereffects", "#visualeffects"],
  "Shake edits": ["#shakeedit", "#shaketransition", "#aftereffects", "#velocityedit", "#editingtok"],
  "Masking & compositing": ["#masking", "#compositing", "#vfxedit", "#aftereffects", "#visualeffects"],
  "Car edits": ["#caredit", "#automotive", "#carculture", "#rollingedit", "#automotivephotography"],
  "Motorcycle edits": ["#motorcycleedit", "#bikelife", "#motoredit", "#ridingculture", "#automotive"],
  "Fashion edits": ["#fashionedit", "#styleinspo", "#fashionfilm", "#ootd", "#fashioncreator"],
  "Photography edits": ["#photoedit", "#photography", "#photoediting", "#visualstorytelling", "#photographytips"],
  "Travel edits": ["#traveledit", "#travelvideo", "#travelcreator", "#cinematictravel", "#wanderlust"],
  "Lifestyle edits": ["#lifestyleedit", "#lifestylecreator", "#dailyvlog", "#visualdiary", "#creatorlife"],
  "Nature edits": ["#natureedit", "#naturevideo", "#earthfocus", "#wildlifevideo", "#landscape"],
  "High-detail edits": ["#highdetailedit", "#detailshot", "#visualeffects", "#colorgrading", "#editingtok"],
  "General TikTok content": ["#editingtok", "#videoedit", "#contentcreator", "#creatorcommunity", "#shortformvideo"],
};

const captionIdeas: Record<string, string[]> = {
  Short: ["A moment, reimagined.", "Made for the replay.", "One more time, with feeling.", "The details make the difference."],
  Aesthetic: ["Some frames stay with you long after the screen fades.", "A little color, a little motion, a feeling you can't quite name.", "For the moments that deserve their own soundtrack."],
  Funny: ["The timeline said one more tweak. It was lying.", "Exported on the first try. (This is a work of fiction.)", "POV: you said this edit would only take 20 minutes."],
  Professional: ["A new edit exploring rhythm, movement, and visual detail.", "Built frame by frame. Which moment stands out to you?", "A study in pacing, color, and a little bit of motion."],
  Custom: ["What part should I edit next?", "Save this for your next creative reset.", "Made this one for the replay button."],
};

const formatBytes = (bytes: number) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index > 1 ? 1 : 0)} ${units[index]}`;
};

const formatDuration = (seconds: number) => {
  if (!Number.isFinite(seconds)) return "—";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const isISODate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  const [year, month, day] = value.split("-").map(Number);
  return Number.isFinite(date.getTime()) && date.getFullYear() === year && date.getMonth() + 1 === month && date.getDate() === day;
};

const formatNumber = (value: number) => new Intl.NumberFormat("en-US", { notation: value > 9999 ? "compact" : "standard", maximumFractionDigits: 1 }).format(value);

function parseCsvRows(source: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  const text = source.replace(/^\uFEFF/, "");

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"' && field.length === 0) {
      quoted = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n" || character === "\r") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      if (character === "\r" && text[index + 1] === "\n") index += 1;
    } else {
      field += character;
    }
  }

  if (quoted) throw new Error("CSV contains an unclosed quoted field.");
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

const workspaceStorageEvent = "viralflow:workspace-storage";
const noopSubscribe = () => () => {};

function getClientDateString() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function readStorageSnapshot(key: string) {
  try {
    return window.localStorage.getItem(key) ?? "";
  } catch (error) {
    console.error("Could not read the local workspace.", error);
    return "";
  }
}

function useLocalStorageState<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  const subscribe = useCallback((onStoreChange: () => void) => {
    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key === key) onStoreChange();
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener(workspaceStorageEvent, onStoreChange);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(workspaceStorageEvent, onStoreChange);
    };
  }, [key]);
  const getSnapshot = useCallback(() => readStorageSnapshot(key), [key]);
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => "");
  const value = useMemo(() => {
    if (!snapshot) return initialValue;
    try {
      return JSON.parse(snapshot) as T;
    } catch (error) {
      console.error(`Could not parse saved workspace data for ${key}.`, error);
      return initialValue;
    }
  }, [initialValue, key, snapshot]);
  const setValue = useCallback<Dispatch<SetStateAction<T>>>((action) => {
    const stored = readStorageSnapshot(key);
    let current = initialValue;
    if (stored) {
      try {
        current = JSON.parse(stored) as T;
      } catch (error) {
        console.error(`Could not parse saved workspace data for ${key}.`, error);
      }
    }
    const nextValue = typeof action === "function" ? (action as (previous: T) => T)(current) : action;
    try {
      window.localStorage.setItem(key, JSON.stringify(nextValue));
      window.dispatchEvent(new Event(workspaceStorageEvent));
    } catch (error) {
      console.error(`Could not save workspace data for ${key}.`, error);
      throw error;
    }
  }, [initialValue, key]);
  return [value, setValue];
}

function Button({
  children,
  variant = "primary",
  onClick,
  type = "button",
  disabled,
  className = "",
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "quiet";
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button className={`button button-${variant} ${className}`} onClick={onClick} type={type} disabled={disabled}>
      {children}
    </button>
  );
}

function MetricCard({ title, value, note, icon: Icon }: { title: string; value: string; note: string; icon: LucideIcon }) {
  return (
    <div className="metric-card">
      <div className="metric-top">
        <span>{title}</span>
        <Icon size={16} strokeWidth={1.7} />
      </div>
      <div className="metric-value">{value}</div>
      <div className="metric-note">{note}</div>
    </div>
  );
}

function EmptyChart({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="empty-chart">
      <div className="empty-chart-icon"><BarChart3 size={19} /></div>
      <div>
        <strong>Your performance data lives here</strong>
        <p>Import analytics or add a post to see real views and engagement trends.</p>
        <button className="text-button" onClick={onAdd}>Add performance data <ArrowRight size={14} /></button>
      </div>
    </div>
  );
}

export default function Home() {
  const [activePage, setActivePage] = useState("Optimize video");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [video, setVideo] = useState<VideoInfo | null>(null);
  const [videoBusy, setVideoBusy] = useState(false);
  const [videoError, setVideoError] = useState("");
  const [optimizedVideo, setOptimizedVideo] = useState<OptimizedVideo | null>(null);
  const [videoQuality, setVideoQuality] = useState<VideoQuality>("balanced");
  const [optimizationBusy, setOptimizationBusy] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  const [optimizationError, setOptimizationError] = useState("");
  const conversionRef = useRef<{ cancel: () => Promise<void> } | null>(null);
  const cancelRequestedRef = useRef(false);
  const [clipCategory, setClipCategory] = useState(defaultCategory);
  const [clips, setClips] = useLocalStorageState<SavedClip[]>("viralflow.clips", []);
  const [posts, setPosts] = useLocalStorageState<Post[]>("viralflow.posts", []);
  const [analytics, setAnalytics] = useLocalStorageState<AnalyticsRow[]>("viralflow.analytics", []);
  const [presets, setPresets] = useLocalStorageState<ExportPreset[]>("viralflow.presets", defaultPresets);
  const [favorites, setFavorites] = useLocalStorageState<string[]>("viralflow.favorites", []);
  const [profileName, setProfileName] = useLocalStorageState("viralflow.profileName", "Creator");
  const [timezone, setTimezone] = useLocalStorageState("viralflow.timezone", "America/Los_Angeles");
  const [contentCategory, setContentCategory] = useLocalStorageState("viralflow.contentCategory", defaultCategory);
  const [preferredCategories, setPreferredCategories] = useLocalStorageState("viralflow.preferredCategories", [defaultCategory]);
  const [audienceLocation, setAudienceLocation] = useLocalStorageState("viralflow.audienceLocation", "");
  const [postingFrequency, setPostingFrequency] = useLocalStorageState("viralflow.postingFrequency", "");
  const [editingSoftware, setEditingSoftware] = useLocalStorageState("viralflow.editingSoftware", "");
  const [preferredContentStyle, setPreferredContentStyle] = useLocalStorageState("viralflow.preferredContentStyle", "");
  const [accountUser, setAccountUser] = useState<CreatorAccount | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [workspaceSyncReady, setWorkspaceSyncReady] = useState(false);
  const [accountError, setAccountError] = useState("");
  const [workspaceSyncError, setWorkspaceSyncError] = useState("");
  const [captionTone, setCaptionTone] = useState("Short");
  const [captionSubject, setCaptionSubject] = useState("");
  const [captions, setCaptions] = useState<string[]>([]);
  const [hashtagQuery, setHashtagQuery] = useState("");
  const [guideIndex, setGuideIndex] = useState(0);
  const [calendarMonth, setCalendarMonth] = useState("");
  const [toast, setToast] = useState("");
  const [analyticsFormOpen, setAnalyticsFormOpen] = useState(false);
  const [presetFormOpen, setPresetFormOpen] = useState(false);
  const [editingPresetName, setEditingPresetName] = useState<string | null>(null);
  const [comparePresetNames, setComparePresetNames] = useState<string[]>([]);
  const [scheduledTitle, setScheduledTitle] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("18:00");
  const [presetDraft, setPresetDraft] = useState<ExportPreset | null>(null);
  const [rowDate, setRowDate] = useState("");
  const [rowTime, setRowTime] = useState("");
  const [rowViews, setRowViews] = useState("");
  const [rowLikes, setRowLikes] = useState("");
  const [rowComments, setRowComments] = useState("");
  const [rowShares, setRowShares] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const clientDateString = useSyncExternalStore(noopSubscribe, getClientDateString, () => "");

  useEffect(() => {
    let cancelled = false;
    const initializeAccount = async () => {
      try {
        const sessionResponse = await fetch("/api/auth/session", { credentials: "same-origin" });
        if (!sessionResponse.ok) throw new Error("Account service is not configured or is temporarily unavailable.");
        const session = (await sessionResponse.json()) as { user: CreatorAccount | null };
        if (cancelled) return;
        if (!session.user) {
          setSessionChecked(true);
          return;
        }

        setAccountUser(session.user);
        const workspaceResponse = await fetch("/api/workspace", { credentials: "same-origin" });
        if (!workspaceResponse.ok) throw new Error("Could not load your account workspace.");
        const result = (await workspaceResponse.json()) as { workspace: Record<string, unknown> | null };
        if (cancelled) return;

        const serverData = result.workspace;
        if (serverData && Object.keys(serverData).length > 0) {
          if (Array.isArray(serverData.clips)) setClips(serverData.clips as SavedClip[]);
          if (Array.isArray(serverData.posts)) setPosts(serverData.posts as Post[]);
          if (Array.isArray(serverData.analytics)) setAnalytics(serverData.analytics as AnalyticsRow[]);
          if (Array.isArray(serverData.presets)) setPresets(serverData.presets as ExportPreset[]);
          if (Array.isArray(serverData.favorites)) setFavorites(serverData.favorites as string[]);
          if (typeof serverData.profileName === "string") setProfileName(serverData.profileName);
          if (typeof serverData.timezone === "string") setTimezone(serverData.timezone);
          if (typeof serverData.contentCategory === "string") setContentCategory(serverData.contentCategory);
          if (Array.isArray(serverData.preferredCategories)) setPreferredCategories(serverData.preferredCategories as string[]);
          if (typeof serverData.audienceLocation === "string") setAudienceLocation(serverData.audienceLocation);
          if (typeof serverData.postingFrequency === "string") setPostingFrequency(serverData.postingFrequency);
          if (typeof serverData.editingSoftware === "string") setEditingSoftware(serverData.editingSoftware);
          if (typeof serverData.preferredContentStyle === "string") setPreferredContentStyle(serverData.preferredContentStyle);
        }

        setWorkspaceSyncReady(true);
        setSessionChecked(true);
      } catch (error) {
        if (!cancelled) {
          setAccountError(error instanceof Error ? error.message : "Account service is unavailable.");
          setSessionChecked(true);
        }
      }
    };

    void initializeAccount();
    return () => { cancelled = true; };
  }, [setAnalytics, setAudienceLocation, setClips, setContentCategory, setEditingSoftware, setFavorites, setPosts, setPostingFrequency, setPreferredCategories, setPreferredContentStyle, setPresets, setProfileName, setTimezone]);

  useEffect(() => {
    if (!accountUser || !workspaceSyncReady) return;
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/workspace", {
          method: "PUT",
          credentials: "same-origin",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ clips, posts, analytics, presets, favorites, profileName, timezone, contentCategory, preferredCategories, audienceLocation, postingFrequency, editingSoftware, preferredContentStyle }),
        });
        if (!response.ok) {
          const result = (await response.json()) as { error?: string };
          throw new Error(result.error ?? "Could not sync your workspace.");
        }
        setWorkspaceSyncError("");
      } catch (error) {
        console.error("Could not sync the account workspace.", error);
        setWorkspaceSyncError(error instanceof Error ? error.message : "Workspace sync failed.");
      }
    }, 650);
    return () => window.clearTimeout(timer);
  }, [accountUser, analytics, audienceLocation, clips, contentCategory, editingSoftware, favorites, posts, postingFrequency, preferredCategories, preferredContentStyle, presets, profileName, timezone, workspaceSyncReady]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => () => {
    if (video?.url) URL.revokeObjectURL(video.url);
  }, [video?.url]);

  useEffect(() => () => {
    if (optimizedVideo?.url) URL.revokeObjectURL(optimizedVideo.url);
  }, [optimizedVideo?.url]);

  const totalViews = analytics.reduce((total, row) => total + row.views, 0);
  const totalEngagements = analytics.reduce((total, row) => total + row.likes + row.comments + row.shares, 0);
  const engagementRate = totalViews > 0 ? `${((totalEngagements / totalViews) * 100).toFixed(1)}%` : "—";
  const averageViews = analytics.length > 0 ? formatNumber(totalViews / analytics.length) : "—";
  const sortedAnalytics = useMemo(() => [...analytics].sort((a, b) => a.date.localeCompare(b.date)), [analytics]);
  const timedAnalytics = useMemo(() => analytics.filter((row) => row.postTime && /^([01]\d|2[0-3]):[0-5]\d$/.test(row.postTime)), [analytics]);
  const hourlyPerformance = useMemo(() => Array.from({ length: 24 }, (_, hour) => {
    const rows = timedAnalytics.filter((row) => Number(row.postTime?.slice(0, 2)) === hour);
    return { hour, count: rows.length, averageViews: rows.length ? rows.reduce((total, row) => total + row.views, 0) / rows.length : 0 };
  }), [timedAnalytics]);
  const weekdayPerformance = useMemo(() => weekdayNames.map((day, weekday) => {
    const rows = timedAnalytics.filter((row) => new Date(`${row.date}T00:00:00`).getDay() === weekday);
    return { day, count: rows.length, averageViews: rows.length ? rows.reduce((total, row) => total + row.views, 0) / rows.length : 0 };
  }), [timedAnalytics]);
  const postingHeatmap = useMemo(() => weekdayNames.flatMap((day, weekday) => hourlyPerformance.map((hour) => {
    const rows = timedAnalytics.filter((row) => new Date(`${row.date}T00:00:00`).getDay() === weekday && Number(row.postTime?.slice(0, 2)) === hour.hour);
    return { day, hour: hour.hour, count: rows.length, averageViews: rows.length ? rows.reduce((total, row) => total + row.views, 0) / rows.length : 0 };
  })), [hourlyPerformance, timedAnalytics]);
  const bestPostingHours = hourlyPerformance.filter((item) => item.count > 0).sort((a, b) => b.averageViews - a.averageViews);
  const bestPostingDay = weekdayPerformance.filter((item) => item.count > 0).sort((a, b) => b.averageViews - a.averageViews)[0];
  const maxPostingCellViews = Math.max(0, ...postingHeatmap.map((cell) => cell.averageViews));

  const selectVideoFile = (file: File | undefined) => {
    if (!file || optimizationBusy) return;
    setVideoError("");
    const hasSupportedExtension = /\.(mp4|mov)$/i.test(file.name);
    if (!hasSupportedExtension) {
      setVideoError("Choose an MP4 or MOV video file.");
      return;
    }
    if (file.size > 300 * 1024 * 1024) {
      setVideoError("Choose a video smaller than 300 MB to keep browser memory use manageable.");
      return;
    }
    if (video?.url) URL.revokeObjectURL(video.url);
    if (optimizedVideo?.url) URL.revokeObjectURL(optimizedVideo.url);
    setOptimizedVideo(null);
    setOptimizationError("");
    setOptimizationProgress(0);
    const url = URL.createObjectURL(file);
    const media = document.createElement("video");
    setVideoBusy(true);
    media.preload = "metadata";
    media.onloadedmetadata = () => {
      setVideo({ name: file.name, size: file.size, type: file.type || "Video", duration: media.duration, width: media.videoWidth, height: media.videoHeight, url, file });
      setVideoBusy(false);
    };
    media.onerror = () => {
      URL.revokeObjectURL(url);
      setVideoBusy(false);
      setVideoError("This browser could not read the video's metadata. Try another MP4 or MOV export.");
    };
    media.src = url;
  };

  const onFileSelected = (event: ChangeEvent<HTMLInputElement>) => {
    selectVideoFile(event.target.files?.[0]);
    event.target.value = "";
  };

  const optimizeVideo = async () => {
    if (!video || optimizationBusy) return;
    setOptimizationBusy(true);
    if (optimizedVideo?.url) URL.revokeObjectURL(optimizedVideo.url);
    setOptimizedVideo(null);
    cancelRequestedRef.current = false;
    setOptimizationError("");
    setOptimizationProgress(0);

    let input: MediaInput | null = null;
    try {
      const {
        ALL_FORMATS,
        BlobSource,
        BufferTarget,
        Conversion,
        Input,
        Mp4OutputFormat,
        Quality,
        Output,
        canEncodeAudio,
        canEncodeVideo,
      } = await import("mediabunny");
      if (cancelRequestedRef.current) throw new Error("Optimization canceled.");

      input = new Input({ source: new BlobSource(video.file), formats: ALL_FORMATS });
      const inputVideoTrack = await input.getPrimaryVideoTrack();
      if (!inputVideoTrack) throw new Error("No video track was found in this file.");
      const [sourceWidth, sourceHeight] = await Promise.all([
        inputVideoTrack.getDisplayWidth(),
        inputVideoTrack.getDisplayHeight(),
      ]);
      if (cancelRequestedRef.current) throw new Error("Optimization canceled.");
      if (!sourceWidth || !sourceHeight) throw new Error("The browser could not read this video's dimensions.");
      const outputTarget = new BufferTarget();
      const output = new Output({
        format: new Mp4OutputFormat({ fastStart: "in-memory" }),
        target: outputTarget,
      });
      const scale = Math.min(1, 1080 / sourceWidth, 1920 / sourceHeight);
      const width = Math.max(2, Math.floor((sourceWidth * scale) / 2) * 2);
      const height = Math.max(2, Math.floor((sourceHeight * scale) / 2) * 2);
      const videoBitrate = Math.round(
        Math.min(12_000_000, Math.max(250_000, width * height * 30 * 0.1)) *
          (videoQuality === "high" ? 1.5 : videoQuality === "compact" ? 0.65 : 1),
      );
      const videoQualityConfig = new Quality({ bitrate: videoBitrate, bitrateMode: "variable" });
      if (!(await canEncodeVideo("avc", { width, height, quality: videoQualityConfig }))) {
        throw new Error("This browser or device cannot encode H.264 video. Try the latest Chrome or Edge on a desktop.");
      }
      if (cancelRequestedRef.current) throw new Error("Optimization canceled.");

      const inputAudioTrack = await input.getPrimaryAudioTrack();
      const inputAudioCodec = inputAudioTrack ? await inputAudioTrack.getCodec() : null;
      const shouldEncodeAudio = Boolean(inputAudioTrack && inputAudioCodec !== "aac");
      if (shouldEncodeAudio && !(await canEncodeAudio("aac", { numberOfChannels: 2, sampleRate: 48_000 }))) {
        throw new Error("This browser or device cannot encode AAC audio. Try the latest Chrome or Edge.");
      }
      if (cancelRequestedRef.current) throw new Error("Optimization canceled.");
      const conversion = await Conversion.init({
        input,
        output,
        tracks: "primary",
        video: {
          codec: "avc",
          quality: videoQualityConfig,
          width,
          height,
          fit: "contain",
          forceTranscode: true,
        },
        audio: inputAudioTrack
          ? { codec: "aac", quality: new Quality({ bitrate: 160_000 }), forceTranscode: shouldEncodeAudio }
          : undefined,
        copy: { mode: "preferred" },
        tags: {},
        showWarnings: false,
      });
      conversionRef.current = conversion;
      if (cancelRequestedRef.current) {
        await conversion.cancel();
        throw new Error("Optimization canceled.");
      }
      conversion.onProgress = (progress) => setOptimizationProgress(Math.min(99, Math.round(progress * 100)));
      await conversion.execute();
      conversionRef.current = null;

      const buffer = outputTarget.buffer;
      if (!buffer || buffer.byteLength === 0) throw new Error("The browser did not produce an optimized video.");
      const blob = new Blob([buffer], { type: "video/mp4" });
      outputTarget.buffer = null;
      const baseName = video.name.replace(/\.[^.]+$/, "");
      setOptimizedVideo({ name: `${baseName}-optimized.mp4`, size: blob.size, url: URL.createObjectURL(blob) });
      setOptimizationProgress(100);
    } catch (error) {
      conversionRef.current = null;
      if (cancelRequestedRef.current) {
        setOptimizationError("Optimization canceled.");
      } else {
        console.error("Local video optimization failed.", error);
        setOptimizationError(error instanceof Error ? error.message : "The video could not be optimized in this browser.");
      }
    } finally {
      input?.dispose();
      conversionRef.current = null;
      setOptimizationBusy(false);
    }
  };

  const cancelOptimization = async () => {
    cancelRequestedRef.current = true;
    if (!conversionRef.current) return;
    try {
      await conversionRef.current.cancel();
    } catch (error) {
      console.error("Could not stop the video optimization cleanly.", error);
    }
  };

  const saveVideoToLibrary = () => {
    if (!video) return;
    setClips((current) => [{ id: crypto.randomUUID(), name: video.name, addedAt: new Date().toISOString(), category: clipCategory, status: "Local file · not uploaded", size: video.size, width: video.width, height: video.height, duration: video.duration }, ...current]);
    setToast("Video details saved to this browser's library. The video file itself was not uploaded.");
  };

  const addAnalyticsRow = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const views = Number(rowViews);
    const likes = Number(rowLikes);
    const comments = Number(rowComments);
    const shares = Number(rowShares);
    if (!isISODate(rowDate) || (rowTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(rowTime)) || !Number.isFinite(views) || !Number.isFinite(likes) || !Number.isFinite(comments) || !Number.isFinite(shares) || views < 0 || likes < 0 || comments < 0 || shares < 0) {
      setToast("Enter a valid date and non-negative metric values.");
      return;
    }
    setAnalytics((current) => [...current, { id: crypto.randomUUID(), date: rowDate, postTime: rowTime || undefined, views, likes, comments, shares }]);
    setRowDate("");
    setRowTime("");
    setRowViews("");
    setRowLikes("");
    setRowComments("");
    setRowShares("");
    setAnalyticsFormOpen(false);
  };

  const importCsv = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      if (file.size > 5 * 1024 * 1024) throw new Error("CSV files must be 5 MB or smaller.");
      const text = await file.text();
      const csvRows = parseCsvRows(text);
      if (csvRows.length < 2) throw new Error("CSV needs a header row and at least one data row.");
      const headers = csvRows[0].map((header) => header.trim().toLowerCase());
      const column = (names: string[]) => headers.findIndex((header) => names.includes(header));
      const dateIndex = column(["date", "posted_at", "post_date"]);
      const timeIndex = column(["post_time", "time", "posted_time"]);
      const viewsIndex = column(["views", "video_views"]);
      const likesIndex = column(["likes"]);
      const commentsIndex = column(["comments"]);
      const sharesIndex = column(["shares"]);
      if (dateIndex < 0 || viewsIndex < 0) throw new Error("CSV must include date and views columns. likes, comments, and shares are optional.");
      const importedRows = csvRows.slice(1).filter((values) => values.some((value) => value.trim() !== "")).map((values, index) => {
        const date = values[dateIndex];
        const postTime = timeIndex >= 0 ? values[timeIndex] : "";
        const views = Number(values[viewsIndex]);
        const likes = likesIndex >= 0 ? Number(values[likesIndex] || 0) : 0;
        const comments = commentsIndex >= 0 ? Number(values[commentsIndex] || 0) : 0;
        const shares = sharesIndex >= 0 ? Number(values[sharesIndex] || 0) : 0;
        if (!isISODate(date) || (postTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(postTime)) || !Number.isFinite(views) || views < 0 || !Number.isFinite(likes) || likes < 0 || !Number.isFinite(comments) || comments < 0 || !Number.isFinite(shares) || shares < 0) {
          throw new Error(`Invalid metrics on CSV row ${index + 2}.`);
        }
        return { id: crypto.randomUUID(), date, postTime: postTime || undefined, views, likes, comments, shares };
      });
      if (importedRows.length === 0) throw new Error("CSV needs at least one analytics data row.");
      setAnalytics((current) => [...current, ...importedRows]);
      setToast(`Imported ${importedRows.length} analytics row${importedRows.length === 1 ? "" : "s"}.`);
    } catch (error) {
      setToast(error instanceof Error ? error.message : "The CSV could not be imported.");
    } finally {
      event.target.value = "";
    }
  };

  const exportAnalyticsCsv = () => {
    if (!analytics.length) {
      setToast("Add or import analytics before exporting a CSV.");
      return;
    }
    const rows = [
      ["date", "post_time", "views", "likes", "comments", "shares"],
      ...analytics.map((row) => [row.date, row.postTime ?? "", row.views, row.likes, row.comments, row.shares]),
    ];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "viralflow-analytics.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const addPost = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!scheduledTitle.trim() || !scheduledDate) return;
    setPosts((current) => [...current, { id: crypto.randomUUID(), title: scheduledTitle.trim(), date: scheduledDate, time: scheduledTime, status: "Scheduled" }]);
    setScheduledTitle("");
    setScheduledDate("");
    setToast("Added to your local content calendar. This does not publish to TikTok.");
  };

  const savePreset = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!presetDraft?.name.trim()) return;
    if (!Number.isFinite(presetDraft.fps) || presetDraft.fps < 1 || presetDraft.fps > 120) {
      setToast("Frame rate must be between 1 and 120 fps.");
      return;
    }
    if (presets.some((preset) => preset.name.toLocaleLowerCase() === presetDraft.name.trim().toLocaleLowerCase() && preset.name !== editingPresetName)) {
      setToast("A preset with that name already exists.");
      return;
    }
    const savedPreset = { ...presetDraft, name: presetDraft.name.trim() };
    if (editingPresetName) {
      setPresets((current) => current.map((preset) => preset.name === editingPresetName ? savedPreset : preset));
      if (editingPresetName !== savedPreset.name) {
        setFavorites((current) => current.map((name) => name === editingPresetName ? savedPreset.name : name));
        setComparePresetNames((current) => current.map((name) => name === editingPresetName ? savedPreset.name : name));
      }
      setToast("Preset updated in this browser.");
    } else {
      setPresets((current) => [...current, savedPreset]);
      setToast("Custom preset saved in this browser.");
    }
    setPresetDraft(null);
    setEditingPresetName(null);
    setPresetFormOpen(false);
  };

  const startPresetDraft = (preset?: ExportPreset) => {
    setEditingPresetName(preset?.name ?? null);
    setPresetDraft(preset ? { ...preset } : {
      name: "",
      category: contentCategory,
      resolution: "1080 × 1920",
      fps: 30,
      bitrate: "16 Mbps",
      codec: "H.264",
      format: "MP4",
      audioBitrate: "320 kbps",
      audioSampleRate: "48 kHz",
      color: "Rec.709",
      profile: "High",
      keyframeInterval: "2 sec",
    });
    setPresetFormOpen(true);
  };

  const makeCaption = () => {
    const ideas = captionIdeas[captionTone] ?? captionIdeas.Short;
    const subject = captionSubject.trim();
    setCaptions(ideas.map((caption) => subject ? caption.replace(/^(A moment|Made for the replay|One more time|The details|A new edit|Built frame by frame|Some frames|A little color|For the moments)/, (match) => `${subject}: ${match.toLowerCase()}`) : caption));
  };

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setToast("Copied to clipboard.");
    } catch (error) {
      console.error("Clipboard access failed.", error);
      setToast("Clipboard access was denied by your browser.");
    }
  };

  const signOut = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
      if (!response.ok) throw new Error("Could not end the current session.");
      setAccountUser(null);
      setWorkspaceSyncReady(false);
      setWorkspaceSyncError("");
      setToast("Signed out. Your server-synced workspace remains with your account.");
    } catch (error) {
      console.error("Could not sign out.", error);
      setToast(error instanceof Error ? error.message : "Sign-out is temporarily unavailable.");
    }
  };

  const toggleFavorite = (name: string) => {
    setFavorites((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name]);
  };

  const togglePresetComparison = (name: string) => {
    if (comparePresetNames.includes(name)) {
      setComparePresetNames((current) => current.filter((item) => item !== name));
      return;
    }
    if (comparePresetNames.length === 2) {
      setToast("Compare up to two presets at a time.");
      return;
    }
    setComparePresetNames((current) => [...current, name]);
  };

  const downloadPreset = (preset: ExportPreset) => {
    const content = [
      `VIRALFLOW EXPORT PRESET — ${preset.name}`,
      `Editing category: ${preset.category}`,
      `Resolution: ${preset.resolution}`,
      `Frame rate: ${preset.fps} fps`,
      `Target bitrate: ${preset.bitrate}`,
      `Video codec: ${preset.codec}`,
      `Container: ${preset.format}`,
      `Audio codec: AAC · ${preset.audioBitrate} · ${preset.audioSampleRate}`,
      `Color: ${preset.color} (confirm project and source color space before export)`,
      `Encoding profile: ${preset.profile}`,
      `Keyframe interval: ${preset.keyframeInterval}`,
      "",
      "Settings are editable starting points. Check current TikTok requirements and your editor's options before publishing.",
    ].join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${preset.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const pageTitle = activePage === "Overview" ? "Overview" : activePage;
  const today = new Date(`${clientDateString || "2000-01-01"}T00:00:00`);
  const calendarDate = new Date(`${calendarMonth || clientDateString.slice(0, 7) || "2000-01"}-01T00:00:00`);
  const monthLabel = calendarDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const firstDay = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1).getDay();
  const daysInMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).getDate();
  const calendarCells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, index) => index + 1)];
  const postByDay = (day: number) => posts.filter((post) => {
    const date = new Date(`${post.date}T00:00:00`);
    return date.getFullYear() === calendarDate.getFullYear() && date.getMonth() === calendarDate.getMonth() && date.getDate() === day;
  });
  const displayHashtags = useMemo(() => {
    const matches = Object.entries(hashtagGroups).filter(([group]) => group.toLowerCase().includes(hashtagQuery.toLowerCase()));
    return matches.length ? matches : Object.entries(hashtagGroups);
  }, [hashtagQuery]);

  const showUpload = () => {
    setActivePage("Optimize video");
    window.setTimeout(() => fileInputRef.current?.click(), 0);
  };

  const renderOverview = () => (
    <>
      <section className="welcome-row">
        <div>
          <div className="eyebrow"><span className="eyebrow-dot" /> YOUR CREATOR WORKSPACE</div>
          <h1>Good to see you, {profileName || "Creator"}<span className="wave">✦</span></h1>
          <p>Keep your edits sharp. Make every post more intentional.</p>
        </div>
        <Button onClick={showUpload}><Upload size={15} /> Optimize a video</Button>
      </section>

      <section className="metric-grid">
        <MetricCard title="VIDEOS IN LIBRARY" value={String(clips.length)} note="Local details saved here" icon={Film} />
        <MetricCard title="POSTS TRACKED" value={String(analytics.length)} note="Imported or added by you" icon={Video} />
        <MetricCard title="AVERAGE VIEWS" value={averageViews} note={analytics.length ? "Across recorded posts" : "No performance data yet"} icon={Activity} />
        <MetricCard title="ENGAGEMENT RATE" value={engagementRate} note={analytics.length ? "Likes + comments + shares" : "Based on your real metrics"} icon={Gauge} />
      </section>

      <section className="dashboard-main-grid">
        <div className="panel performance-panel">
          <div className="panel-heading">
            <div><h2>Performance</h2><p>Actual data you add to your workspace</p></div>
            <button className="range-selector" onClick={() => setActivePage("Analytics")}>All time <ChevronDown size={14} /></button>
          </div>
          <div className="chart-summary"><strong>{analytics.length ? formatNumber(totalViews) : "—"}</strong><span>total views</span><span className="chart-date">Views over time</span></div>
          {sortedAnalytics.length > 0 ? (
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sortedAnalytics}>
                  <defs><linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#9b7aff" stopOpacity={0.29} /><stop offset="95%" stopColor="#9b7aff" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid stroke="#24242d" strokeDasharray="3 5" vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: "#777783", fontSize: 11 }} tickFormatter={(value: string) => new Date(`${value}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" })} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "#777783", fontSize: 11 }} tickFormatter={(value: number) => formatNumber(value)} width={42} />
                  <Tooltip contentStyle={{ background: "#17171d", border: "1px solid #30303a", borderRadius: 9, color: "#f3f1f8", fontSize: 12 }} labelFormatter={(value) => String(value)} />
                  <Area type="monotone" dataKey="views" stroke="#a78bfa" strokeWidth={2} fill="url(#viewsGradient)" dot={sortedAnalytics.length === 1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : <EmptyChart onAdd={() => { setActivePage("Analytics"); setAnalyticsFormOpen(true); }} />}
        </div>

        <div className="panel next-move-panel">
          <div className="panel-heading"><div><div className="eyebrow"><Sparkles size={12} /> YOUR NEXT MOVE</div><h2>Built on your data</h2></div><div className="next-move-icon"><Lightbulb size={17} /></div></div>
          {analytics.length ? (
            <div className="recommendation-card"><div className="recommendation-label">PERFORMANCE SNAPSHOT</div><p>You have logged <strong>{analytics.length} post{analytics.length === 1 ? "" : "s"}</strong> with an average of <strong>{averageViews} views</strong>. Add more posts to uncover patterns by time and format.</p><button className="text-button" onClick={() => setActivePage("Analytics")}>Review your analytics <ArrowRight size={14} /></button></div>
          ) : (
            <div className="recommendation-empty"><div className="soft-icon"><Lightbulb size={17} /></div><strong>Good insights start with your data.</strong><p>Import post analytics or log a video to unlock recommendations tailored to your actual performance.</p><Button variant="secondary" onClick={() => { setActivePage("Analytics"); setAnalyticsFormOpen(true); }}><Plus size={14} /> Add your first post</Button></div>
          )}
          <div className="panel-separator" />
          <div className="up-next-head"><span>UP NEXT</span><button className="text-button" onClick={() => setActivePage("Content Calendar")}>View calendar <ArrowRight size={13} /></button></div>
          {posts.filter((post) => post.status === "Scheduled").length ? posts.filter((post) => post.status === "Scheduled").slice(0, 2).map((post) => (
            <div className="upcoming-item" key={post.id}><div className="upcoming-date"><strong>{new Date(`${post.date}T00:00:00`).getDate()}</strong><span>{new Date(`${post.date}T00:00:00`).toLocaleDateString("en-US", { month: "short" })}</span></div><div className="upcoming-name"><strong>{post.title}</strong><span>{post.time} · Planned</span></div><MoreHorizontal size={17} /></div>
          )) : <p className="muted-small">No posts planned. Add one to your calendar when you’re ready.</p>}
        </div>
      </section>

      <section className="dashboard-bottom-grid">
        <div className="panel quick-actions-panel">
          <div className="panel-heading"><div><h2>Quick actions</h2><p>Pick up where your next edit begins.</p></div></div>
          <div className="quick-actions">
            <button onClick={showUpload}><span className="quick-action-icon violet"><Upload size={17} /></span><span><strong>Optimize a video</strong><small>Prepare a local H.264 MP4 export</small></span><ArrowRight size={15} /></button>
            <button onClick={() => setActivePage("Export Settings")}><span className="quick-action-icon blue"><Settings size={17} /></span><span><strong>Browse export presets</strong><small>Starting points for every editing style</small></span><ArrowRight size={15} /></button>
            <button onClick={() => setActivePage("Caption Generator")}><span className="quick-action-icon amber"><WandSparkles size={17} /></span><span><strong>Draft a caption</strong><small>Find a line that sounds like you</small></span><ArrowRight size={15} /></button>
          </div>
        </div>
        <div className="panel recent-panel">
          <div className="panel-heading"><div><h2>Recent videos</h2><p>Files you’ve saved in this browser</p></div><button className="text-button" onClick={() => setActivePage("Video Library")}>Open library <ArrowRight size={13} /></button></div>
          {clips.length ? clips.slice(0, 3).map((clip) => (
            <div className="recent-item" key={clip.id}><div className="recent-thumb"><FileVideo2 size={17} /></div><div className="recent-name"><strong>{clip.name}</strong><span>{clip.category} · {clip.width} × {clip.height} · {formatBytes(clip.size)}</span></div><span className="status-pill">{clip.status}</span></div>
          )) : <div className="empty-recent"><div className="soft-icon"><Film size={18} /></div><span>Your library is waiting for its first edit.</span><button className="text-button" onClick={showUpload}>Add a video <ArrowRight size={13} /></button></div>}
        </div>
      </section>
    </>
  );

  const renderVideoTool = () => (
    <>
      <section className="optimizer-hero">
        <div>
          <div className="eyebrow">LOCAL VIDEO OPTIMIZER</div>
          <h1>Keep your edit looking like your edit.</h1>
          <p>Re-encode a clean MP4 for TikTok Web. Your video stays on this device from start to finish.</p>
        </div>
        <span className="local-badge"><ShieldCheck size={14} /> Private by design</span>
      </section>

      <div className="optimizer-layout">
        <section className="panel optimizer-panel">
          <div className="panel-heading">
            <div><h2>{video ? "Your video" : "Choose a video"}</h2><p>MP4 or MOV · up to 300 MB · one file at a time</p></div>
            <div className="upload-panel-icon"><Clapperboard size={17} /></div>
          </div>
          <input ref={fileInputRef} className="visually-hidden" type="file" accept=".mp4,.mov,video/mp4,video/quicktime" onChange={onFileSelected} disabled={optimizationBusy} />
          {!video && (
            <button
              className="optimizer-dropzone"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => { event.preventDefault(); selectVideoFile(event.dataTransfer.files[0]); }}
            >
              {videoBusy ? <LoaderCircle className="spin" size={26} /> : <div className="drop-icon"><Upload size={20} /></div>}
              <strong>{videoBusy ? "Reading video…" : "Drop your video here"}</strong>
              <span>or <em>browse files</em> on your device</span>
              <small>MP4 and MOV · maximum 300 MB</small>
            </button>
          )}
          {videoError && <p className="error-message"><CircleHelp size={14} />{videoError}</p>}
          {video && (
            <>
              <div className="optimizer-preview-wrap">
                <video className="optimizer-preview" src={video.url} controls playsInline preload="metadata" />
                <button className="optimizer-remove" aria-label="Remove selected video" onClick={() => { URL.revokeObjectURL(video.url); setVideo(null); setOptimizedVideo(null); setOptimizationError(""); }} disabled={optimizationBusy}>
                  <X size={14} />
                </button>
              </div>
              <div className="optimizer-file-row">
                <div className="file-type-icon"><FileVideo2 size={18} /></div>
                <div className="file-name"><strong title={video.name}>{video.name}</strong><span>{video.width} × {video.height} · {formatDuration(video.duration)} · {formatBytes(video.size)}</span></div>
                <button className="text-button" onClick={() => fileInputRef.current?.click()} disabled={optimizationBusy}>Change</button>
              </div>
              <div className="quality-picker">
                <div className="quality-picker-heading"><strong>Choose an output style</strong><span>H.264 MP4 · up to 1080p</span></div>
                <div className="quality-options">
                  {([
                    { id: "high", title: "High detail", detail: "More data, fewer compromises" },
                    { id: "balanced", title: "Balanced", detail: "A practical everyday export" },
                    { id: "compact", title: "Smaller file", detail: "Use when upload size matters" },
                  ] as const).map((option) => (
                    <button
                      type="button"
                      key={option.id}
                      className={`quality-option ${videoQuality === option.id ? "selected" : ""}`}
                      onClick={() => setVideoQuality(option.id)}
                      aria-pressed={videoQuality === option.id}
                      disabled={optimizationBusy}
                    >
                      <span className="quality-radio">{videoQuality === option.id && <i />}</span>
                      <strong>{option.title}</strong>
                      <small>{option.detail}</small>
                    </button>
                  ))}
                </div>
              </div>
              {optimizationBusy ? (
                <div className="optimization-progress">
                  <div className="optimization-progress-label"><strong>Optimizing on this device</strong><span>{optimizationProgress}%</span></div>
                  <div className="progress-track" role="progressbar" aria-valuenow={optimizationProgress} aria-valuemin={0} aria-valuemax={100} aria-label="Video optimization progress"><div style={{ width: `${optimizationProgress}%` }} /></div>
                  <div className="optimization-progress-footer"><span>Keep this tab open while your browser encodes the video.</span><button className="text-button" onClick={cancelOptimization}>Cancel</button></div>
                </div>
              ) : (
                <button className="button button-primary optimize-button" onClick={optimizeVideo} disabled={videoBusy}>
                  <Sparkles size={15} /> Optimize video
                </button>
              )}
              {optimizationError && <p role="alert" className="auth-error optimizer-error">{optimizationError}</p>}
              {optimizedVideo && (
                <div className="optimized-result">
                  <div className="optimized-result-copy">
                    <span className="optimized-check"><Check size={14} /></span>
                    <div><strong>Your optimized video is ready</strong><span>{formatBytes(optimizedVideo.size)} · MP4 · processed locally</span></div>
                  </div>
                  <a className="button button-primary download-video-button" href={optimizedVideo.url} download={optimizedVideo.name}><Download size={15} /> Download MP4</a>
                  {optimizedVideo.size > video.size && <p>The optimized file is larger than the original. Try “Smaller file” if you need a smaller download.</p>}
                  <a className="upload-tiktok-link" href="https://www.tiktok.com/tiktokstudio/upload" target="_blank" rel="noreferrer">Open TikTok Web upload <ArrowRight size={14} /></a>
                </div>
              )}
            </>
          )}
          {!video && (
            <div className="optimizer-privacy"><ShieldCheck size={15} /><span>Your file is read and encoded in your browser. It is never sent to VIRALFLOW.</span></div>
          )}
        </section>

        <aside className="optimizer-side">
          <section className="panel optimizer-spec-panel">
            <div className="panel-heading"><div><h2>What you’ll get</h2><p>Consistent playback, ready to download</p></div><div className="soft-icon"><Check size={16} /></div></div>
            <div className="optimizer-spec-list">
              <div><span className="check-mark passed"><Check size={12} /></span><span><strong>MP4 container</strong><small>Fast-start for easier playback</small></span></div>
              <div><span className="check-mark passed"><Check size={12} /></span><span><strong>H.264 video</strong><small>Common browser-compatible format</small></span></div>
              <div><span className="check-mark passed"><Check size={12} /></span><span><strong>AAC audio</strong><small>Audio is preserved when present</small></span></div>
              <div><span className="check-mark passed"><Check size={12} /></span><span><strong>Original framing</strong><small>Aspect ratio stays intact; no crop</small></span></div>
            </div>
            <div className="optimizer-disclaimer"><Lightbulb size={14} /><span>Re-encoding can change detail. Keep your original master. TikTok’s private compression process is not simulated.</span></div>
          </section>
          {video && <section className="panel optimizer-library-panel">
            <div><div className="eyebrow">KEEP YOUR WORK ORGANIZED</div><h2>Save video details</h2><p>Add the source file to your local video library. The video itself stays on your device.</p></div>
            <label className="field-label">Editing category</label>
            <select value={clipCategory} onChange={(event) => setClipCategory(event.target.value)}>{categories.map((category) => <option key={category}>{category}</option>)}</select>
            <Button variant="secondary" className="save-video-button" onClick={saveVideoToLibrary}><Plus size={14} /> Save to library</Button>
          </section>}
          <section className="panel optimizer-guide-panel">
            <div className="eyebrow">THREE QUICK STEPS</div>
            <ol>
              <li><span>1</span><div><strong>Choose your export</strong><small>Pick an MP4 or MOV from your device.</small></div></li>
              <li><span>2</span><div><strong>Optimize locally</strong><small>Select a quality profile and keep this tab open.</small></div></li>
              <li><span>3</span><div><strong>Download and upload</strong><small>Post the result using TikTok Web.</small></div></li>
            </ol>
            <a href="https://www.tiktok.com/tiktokstudio/upload" target="_blank" rel="noreferrer">TikTok Web upload guide <ArrowRight size={13} /></a>
          </section>
        </aside>
      </div>
    </>
  );

  const renderExportSettings = () => (
    <>
      <div className="page-intro"><div><div className="eyebrow">YOUR EDITOR, YOUR SETTINGS</div><h1>Export settings</h1><p>Flexible starting points for different editing styles — not one-size-fits-all rules.</p></div><Button onClick={() => startPresetDraft()}><Plus size={15} /> Create preset</Button></div>
      <div className="notice-banner"><Lightbulb size={16} /><span>Presets are editable starting points, not guaranteed platform specifications. Match settings to your source footage, timeline, editor, and TikTok’s current requirements.</span></div>
      {presetFormOpen && presetDraft && (
        <form className="panel preset-form" onSubmit={savePreset}>
          <div className="panel-heading"><div><h2>{editingPresetName ? "Edit export preset" : "New custom preset"}</h2><p>All values are editable and saved in this browser.</p></div><button className="icon-button" type="button" aria-label="Close preset editor" onClick={() => { setPresetFormOpen(false); setPresetDraft(null); setEditingPresetName(null); }}><X size={16} /></button></div>
          <div className="form-grid">
            <label>Preset name<input required maxLength={60} value={presetDraft.name} onChange={(event) => setPresetDraft((current) => current ? { ...current, name: event.target.value } : current)} placeholder="e.g. High-detail master" /></label>
            <label>Editing category<input value={presetDraft.category} onChange={(event) => setPresetDraft((current) => current ? { ...current, category: event.target.value } : current)} /></label>
            <label>Resolution<input value={presetDraft.resolution} onChange={(event) => setPresetDraft((current) => current ? { ...current, resolution: event.target.value } : current)} /></label>
            <label>Frame rate<input type="number" min="1" max="120" value={presetDraft.fps} onChange={(event) => setPresetDraft((current) => current ? { ...current, fps: Number(event.target.value) } : current)} /></label>
            <label>Target bitrate<input value={presetDraft.bitrate} onChange={(event) => setPresetDraft((current) => current ? { ...current, bitrate: event.target.value } : current)} /></label>
            <label>Video codec<select value={presetDraft.codec} onChange={(event) => setPresetDraft((current) => current ? { ...current, codec: event.target.value } : current)}><option>H.264</option><option>H.265</option></select></label>
            <label>Container<select value={presetDraft.format} onChange={(event) => setPresetDraft((current) => current ? { ...current, format: event.target.value } : current)}><option>MP4</option><option>MOV</option></select></label>
            <label>Audio bitrate<select value={presetDraft.audioBitrate} onChange={(event) => setPresetDraft((current) => current ? { ...current, audioBitrate: event.target.value } : current)}><option>128 kbps</option><option>192 kbps</option><option>256 kbps</option><option>320 kbps</option></select></label>
            <label>Audio sample rate<select value={presetDraft.audioSampleRate} onChange={(event) => setPresetDraft((current) => current ? { ...current, audioSampleRate: event.target.value } : current)}><option>44.1 kHz</option><option>48 kHz</option><option>96 kHz</option></select></label>
            <label>Color space<input value={presetDraft.color} onChange={(event) => setPresetDraft((current) => current ? { ...current, color: event.target.value } : current)} /></label>
            <label>Encoding profile<input value={presetDraft.profile} onChange={(event) => setPresetDraft((current) => current ? { ...current, profile: event.target.value } : current)} /></label>
            <label>Keyframe interval<input value={presetDraft.keyframeInterval} onChange={(event) => setPresetDraft((current) => current ? { ...current, keyframeInterval: event.target.value } : current)} /></label>
          </div>
          <div className="preset-form-actions"><Button type="submit"><Check size={14} /> {editingPresetName ? "Save changes" : "Save preset"}</Button><Button variant="secondary" onClick={() => { setPresetFormOpen(false); setPresetDraft(null); setEditingPresetName(null); }}>Cancel</Button></div>
        </form>
      )}
      <div className="preset-list">
        {presets.map((preset) => (
          <div className="panel preset-card" key={preset.name}>
            <div className="preset-card-head"><div className="preset-badge"><Film size={16} /></div><div className="preset-title"><h2>{preset.name}</h2><span>{preset.category}</span></div><button className={`icon-button favorite-button ${favorites.includes(preset.name) ? "favorited" : ""}`} aria-label={favorites.includes(preset.name) ? "Remove favorite" : "Add favorite"} onClick={() => toggleFavorite(preset.name)}><Heart size={16} fill={favorites.includes(preset.name) ? "currentColor" : "none"} /></button></div>
            <div className="preset-specs"><div><span>RESOLUTION</span><strong>{preset.resolution}</strong></div><div><span>FRAME RATE</span><strong>{preset.fps} fps</strong></div><div><span>BITRATE</span><strong>{preset.bitrate}</strong></div><div><span>VIDEO CODEC</span><strong>{preset.codec}</strong></div><div><span>CONTAINER</span><strong>{preset.format}</strong></div><div><span>AUDIO</span><strong>AAC · {preset.audioBitrate} · {preset.audioSampleRate}</strong></div><div><span>COLOR</span><strong>{preset.color}</strong></div><div><span>PROFILE / KEYFRAME</span><strong>{preset.profile} · {preset.keyframeInterval}</strong></div></div>
            <div className="preset-foot"><button className={`compare-toggle ${comparePresetNames.includes(preset.name) ? "selected" : ""}`} onClick={() => togglePresetComparison(preset.name)}>{comparePresetNames.includes(preset.name) ? <Check size={13} /> : <Plus size={13} />} {comparePresetNames.includes(preset.name) ? "Selected to compare" : "Compare"}</button><div className="preset-foot-actions"><Button variant="secondary" onClick={() => startPresetDraft(preset)}><Settings size={13} /> Edit</Button><Button variant="secondary" onClick={() => downloadPreset(preset)}><Download size={14} /> Export</Button></div></div>
          </div>
        ))}
      </div>
      {comparePresetNames.length === 2 && <div className="panel comparison-panel"><div className="panel-heading"><div><h2>Preset comparison</h2><p>Compare your selected settings side by side.</p></div><button className="text-button" onClick={() => setComparePresetNames([])}>Clear comparison <X size={13} /></button></div><div className="comparison-grid"><div className="comparison-labels"><strong>SETTING</strong>{["Resolution", "Frame rate", "Bitrate", "Video codec", "Container", "Audio", "Color", "Profile / keyframe"].map((item) => <span key={item}>{item}</span>)}</div>{comparePresetNames.map((name) => { const preset = presets.find((item) => item.name === name); return preset ? <div className="comparison-column" key={name}><strong>{preset.name}</strong><span>{preset.resolution}</span><span>{preset.fps} fps</span><span>{preset.bitrate}</span><span>{preset.codec}</span><span>{preset.format}</span><span>AAC · {preset.audioBitrate} · {preset.audioSampleRate}</span><span>{preset.color}</span><span>{preset.profile} · {preset.keyframeInterval}</span></div> : null; })}</div></div>}
      <div className="support-strip"><span>DESIGNED TO WORK WITH</span>{["After Effects", "Premiere Pro", "CapCut", "DaVinci Resolve", "Final Cut Pro"].map((item) => <strong key={item}>{item}</strong>)}</div>
    </>
  );

  const renderAnalytics = () => (
    <>
      <div className="page-intro"><div><div className="eyebrow">YOUR DATA, YOUR DECISIONS</div><h1>{activePage}</h1><p>Only metrics you import or add are shown. No simulated performance figures.</p></div><div className="page-actions"><Button variant="secondary" onClick={exportAnalyticsCsv}><Download size={14} /> Export CSV</Button><Button variant="secondary" onClick={() => csvInputRef.current?.click()}><Upload size={14} /> Import CSV</Button><Button onClick={() => setAnalyticsFormOpen(true)}><Plus size={15} /> Add a post</Button></div></div>
      <input ref={csvInputRef} className="visually-hidden" type="file" accept=".csv,text/csv" onChange={importCsv} />
      <div className="metric-grid analytics-metrics"><MetricCard title="TOTAL VIEWS" value={analytics.length ? formatNumber(totalViews) : "—"} note={analytics.length ? `${analytics.length} recorded posts` : "Add data to get started"} icon={Activity} /><MetricCard title="LIKES" value={analytics.length ? formatNumber(analytics.reduce((total, row) => total + row.likes, 0)) : "—"} note="From imported rows" icon={Heart} /><MetricCard title="COMMENTS" value={analytics.length ? formatNumber(analytics.reduce((total, row) => total + row.comments, 0)) : "—"} note="From imported rows" icon={Video} /><MetricCard title="ENGAGEMENT" value={engagementRate} note="Likes + comments + shares / views" icon={Gauge} /></div>
      <div className="panel analytics-panel"><div className="panel-heading"><div><h2>Views over time</h2><p>From your imported analytics</p></div><div className="data-count">{analytics.length} ROWS</div></div>{sortedAnalytics.length > 0 ? <div className="chart-wrap tall-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={sortedAnalytics}><defs><linearGradient id="analyticsGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8a6cff" stopOpacity={0.29} /><stop offset="95%" stopColor="#8a6cff" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#24242d" strokeDasharray="3 5" vertical={false} /><XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: "#777783", fontSize: 11 }} /><YAxis tickLine={false} axisLine={false} tick={{ fill: "#777783", fontSize: 11 }} width={45} /><Tooltip contentStyle={{ background: "#17171d", border: "1px solid #30303a", borderRadius: 9, color: "#f3f1f8", fontSize: 12 }} /><Area type="monotone" dataKey="views" stroke="#a78bfa" strokeWidth={2} fill="url(#analyticsGradient)" dot={sortedAnalytics.length === 1} /></AreaChart></ResponsiveContainer></div> : <EmptyChart onAdd={() => setAnalyticsFormOpen(true)} />}</div>
      <div className="panel data-panel"><div className="panel-heading"><div><h2>Recorded posts</h2><p>Imported and manually entered metrics</p></div><span className="data-count">{analytics.length} POSTS</span></div>{analytics.length ? <div className="table-scroll"><table><thead><tr><th>POST DATE</th><th>VIEWS</th><th>LIKES</th><th>COMMENTS</th><th>SHARES</th><th></th></tr></thead><tbody>{sortedAnalytics.map((row) => <tr key={row.id}><td>{row.date}</td><td>{formatNumber(row.views)}</td><td>{formatNumber(row.likes)}</td><td>{formatNumber(row.comments)}</td><td>{formatNumber(row.shares)}</td><td><button className="icon-button" aria-label={`Remove post from ${row.date}`} onClick={() => setAnalytics((current) => current.filter((item) => item.id !== row.id))}><X size={14} /></button></td></tr>)}</tbody></table></div> : <div className="inline-empty"><BarChart3 size={18} /><span>Nothing recorded yet. Import a TikTok analytics CSV or add a post manually.</span></div>}</div>
      {analyticsFormOpen && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setAnalyticsFormOpen(false); }}><form className="modal-card" onSubmit={addAnalyticsRow}><div className="panel-heading"><div><h2>Add post metrics</h2><p>Enter actual data from your TikTok analytics.</p></div><button className="icon-button" type="button" onClick={() => setAnalyticsFormOpen(false)}><X size={16} /></button></div><div className="form-grid"><label>Post date<input type="date" required value={rowDate} onChange={(event) => setRowDate(event.target.value)} /></label><label>Post time (optional)<input type="time" value={rowTime} onChange={(event) => setRowTime(event.target.value)} /></label><label>Views<input type="number" min="0" required value={rowViews} onChange={(event) => setRowViews(event.target.value)} placeholder="0" /></label><label>Likes<input type="number" min="0" value={rowLikes} onChange={(event) => setRowLikes(event.target.value)} placeholder="0" /></label><label>Comments<input type="number" min="0" value={rowComments} onChange={(event) => setRowComments(event.target.value)} placeholder="0" /></label><label>Shares<input type="number" min="0" value={rowShares} onChange={(event) => setRowShares(event.target.value)} placeholder="0" /></label></div><div className="modal-actions"><Button variant="secondary" onClick={() => setAnalyticsFormOpen(false)}>Cancel</Button><Button type="submit"><Check size={14} /> Save metrics</Button></div></form></div>}
    </>
  );

  const renderCalendar = () => (
    <>
      <div className="page-intro"><div><div className="eyebrow">PLAN AT YOUR PACE</div><h1>{activePage}</h1><p>Draft a schedule for yourself. Posts are not sent to TikTok.</p></div><Button onClick={() => document.getElementById("calendar-post-title")?.focus()}><Plus size={15} /> Plan a post</Button></div>
      <div className="calendar-layout">
        <div className="panel calendar-panel">
          <div className="calendar-head"><div><h2>{monthLabel}</h2><p>{posts.filter((post) => post.status === "Scheduled").length} planned · {posts.filter((post) => post.status === "Draft").length} drafts</p></div><div className="calendar-controls"><button className="icon-button" aria-label="Previous month" onClick={() => { const date = new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1); setCalendarMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`); }}><ChevronLeft size={17} /></button><button className="icon-button" aria-label="Next month" onClick={() => { const date = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1); setCalendarMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`); }}><ChevronRight size={17} /></button></div></div>
          <div className="calendar-grid">{["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => <div className="calendar-weekday" key={day}>{day}</div>)}{calendarCells.map((day, index) => <div className={`calendar-cell ${day === today.getDate() && calendarDate.getMonth() === today.getMonth() && calendarDate.getFullYear() === today.getFullYear() ? "is-today" : ""}`} key={`${day}-${index}`}>{day && <><span className="calendar-day-number">{day}</span>{postByDay(day).map((post) => <div className={`calendar-post ${post.status.toLowerCase()}`} key={post.id} title={`${post.title} · ${post.time}`}>{post.title}</div>)}</>}</div>)}</div>
          <div className="calendar-legend"><span><i className="legend-dot planned" />Planned</span><span><i className="legend-dot draft" />Draft</span><span><i className="legend-dot published" />Published (manual)</span></div>
        </div>
        <div className="panel plan-form-panel"><div className="panel-heading"><div><h2>Plan a post</h2><p>Add a reminder to your local calendar.</p></div><div className="upload-panel-icon"><CalendarDays size={17} /></div></div><form onSubmit={addPost}><label className="field-label" htmlFor="calendar-post-title">Post title</label><input id="calendar-post-title" required value={scheduledTitle} onChange={(event) => setScheduledTitle(event.target.value)} placeholder="What's this edit about?" /><div className="form-grid"><label>Date<input type="date" required value={scheduledDate} onChange={(event) => setScheduledDate(event.target.value)} /></label><label>Time<input type="time" value={scheduledTime} onChange={(event) => setScheduledTime(event.target.value)} /></label></div><Button type="submit" className="full-button"><Plus size={14} /> Add to calendar</Button></form><div className="manual-publish-note"><ShieldCheck size={14} /> Manual planning only — no TikTok connection is configured.</div></div>
      </div>
      <div className="panel post-queue-panel"><div className="panel-heading"><div><h2>Planned posts</h2><p>Your upcoming content queue</p></div><span className="data-count">{posts.length} ITEMS</span></div>{posts.length ? [...posts].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)).map((post) => <div className="queue-row" key={post.id}><div className="queue-date"><strong>{new Date(`${post.date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</strong><span>{post.time}</span></div><div className="queue-title"><strong>{post.title}</strong><span>Manual workflow</span></div><span className={`queue-status ${post.status.toLowerCase()}`}>{post.status}</span><button className="icon-button" aria-label="Delete planned post" onClick={() => setPosts((current) => current.filter((item) => item.id !== post.id))}><X size={14} /></button></div>) : <div className="inline-empty"><CalendarDays size={18} /><span>No posts in your queue yet.</span></div>}</div>
    </>
  );

  const renderCaptions = () => (
    <>
      <div className="page-intro"><div><div className="eyebrow">FIND THE RIGHT WORDS</div><h1>Caption generator</h1><p>Quick, editable prompts for any style of edit. No AI service or external API is connected.</p></div><div className="caption-orb"><WandSparkles size={18} /></div></div>
      <div className="caption-layout">
        <div className="panel caption-form-panel"><div className="panel-heading"><div><h2>Set the vibe</h2><p>Make these prompts your own.</p></div></div><label className="field-label">Editing category</label><select value={contentCategory} onChange={(event) => setContentCategory(event.target.value)}>{categories.map((category) => <option key={category}>{category}</option>)}</select><label className="field-label">Subject or context <span className="optional">OPTIONAL</span></label><input value={captionSubject} onChange={(event) => setCaptionSubject(event.target.value)} placeholder="e.g. late-night city drive" /><label className="field-label">Tone</label><div className="tone-chips">{Object.keys(captionIdeas).map((tone) => <button type="button" onClick={() => setCaptionTone(tone)} className={captionTone === tone ? "selected" : ""} key={tone}>{tone}</button>)}</div><Button onClick={makeCaption} className="full-button"><Sparkles size={15} /> Generate ideas</Button><p className="caption-note">These are simple template prompts, not trend or performance predictions.</p></div>
        <div className="panel caption-results-panel">
          <div className="panel-heading">
            <div><h2>Caption ideas</h2><p>{captions.length ? `${captions.length} options · Edit freely before posting` : "Your ideas will appear here"}</p></div>
            <span className="soft-label">{contentCategory.toUpperCase()}</span>
          </div>
          {captions.length ? (
            <div className="caption-list">
              {captions.map((caption, index) => (
                <div className="caption-item" key={`${caption}-${index}`}>
                  <div className="caption-item-top"><span>OPTION 0{index + 1}</span><button className="icon-button" aria-label="Copy caption" onClick={() => copyText(caption)}><Copy size={14} /></button></div>
                  <p>{caption}</p>
                  <div className="caption-item-foot"><span>{caption.length} characters</span><button className="text-button" onClick={() => copyText(caption)}>Copy caption <ArrowRight size={13} /></button></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="caption-empty"><div className="caption-preview"><span>YOUR NEXT CAPTION</span><p>A good caption sounds like you.<br />Let’s find yours.</p><div className="caption-preview-line" /><small>{contentCategory} · ready when you are</small></div></div>
          )}
        </div>
      </div>
    </>
  );

  const renderHashtags = () => (
    <>
      <div className="page-intro"><div><div className="eyebrow">EXPLORE BY EDITING STYLE</div><h1>Hashtag research</h1><p>Browse relevant starting points across editing communities. No live popularity metrics are shown.</p></div><div className="hashtag-symbol">#</div></div>
      <div className="panel hashtag-search-panel"><Search size={17} /><input value={hashtagQuery} onChange={(event) => setHashtagQuery(event.target.value)} placeholder="Search a category, like gaming or cinematic…" aria-label="Search hashtag categories" /><span>CURATED TAGS</span></div>
      <div className="hashtag-groups">{displayHashtags.map(([group, tags], index) => <div className="panel hashtag-card" key={group}><div className="hashtag-group-head"><div className={`hashtag-category-icon tint-${index % 4}`}><Hash size={16} /></div><div><h2>{group}</h2><span>Editing community</span></div><button className="text-button" onClick={() => copyText(tags.join(" "))}><Copy size={13} /> Copy all</button></div><div className="hashtag-chips">{tags.map((tag) => <button key={tag} onClick={() => copyText(tag)}>{tag}</button>)}</div><div className="hashtag-disclaimer">Relevant ideas, not a guarantee of reach or performance.</div></div>)}</div>
    </>
  );

  const renderPostingTimes = () => (
    <>
      <div className="page-intro"><div><div className="eyebrow">YOUR POST HISTORY, YOUR TIMEZONE</div><h1>{activePage}</h1><p>Patterns are calculated only from posts with timestamps and metrics you enter or import.</p></div><div className="timezone-select"><Clock3 size={14} /><select value={timezone} onChange={(event) => setTimezone(event.target.value)}><option>America/Los_Angeles</option><option>America/New_York</option><option>America/Chicago</option><option>Europe/London</option><option>Europe/Paris</option><option>Asia/Tokyo</option><option>Australia/Sydney</option></select></div></div>
      <div className="schedule-insight-grid">
        <div className="panel schedule-insight"><div className="schedule-insight-icon"><Clock3 size={17} /></div><span>TOP POSTING HOUR</span><strong>{bestPostingHours.length ? new Date(2000, 0, 1, bestPostingHours[0].hour).toLocaleTimeString("en-US", { hour: "numeric" }) : "—"}</strong><small>{bestPostingHours.length ? `${formatNumber(bestPostingHours[0].averageViews)} average views · ${bestPostingHours[0].count} post${bestPostingHours[0].count === 1 ? "" : "s"}` : "Add a post time to see patterns"}</small></div>
        <div className="panel schedule-insight"><div className="schedule-insight-icon"><CalendarDays size={17} /></div><span>TOP POSTING DAY</span><strong>{bestPostingDay ? bestPostingDay.day : "—"}</strong><small>{bestPostingDay ? `${formatNumber(bestPostingDay.averageViews)} average views · ${bestPostingDay.count} post${bestPostingDay.count === 1 ? "" : "s"}` : "No timestamped posts yet"}</small></div>
        <div className="panel schedule-insight"><div className="schedule-insight-icon"><BarChart3 size={17} /></div><span>SAMPLE / CONFIDENCE</span><strong>{timedAnalytics.length ? timedAnalytics.length < 5 ? "Low" : timedAnalytics.length < 15 ? "Moderate" : "Larger sample" : "—"}</strong><small>{timedAnalytics.length} timestamped post{timedAnalytics.length === 1 ? "" : "s"} · observational, not predictive</small></div>
      </div>
      <div className="panel heatmap-panel"><div className="panel-heading"><div><h2>Observed post performance by time</h2><p>Cell color reflects average views for your posts in each day/hour slot.</p></div><span className="soft-label">POST TIMES · {timezone.replace("_", " ")}</span></div>
        {timedAnalytics.length ? (
          <>
            <div className="best-time-summary">{bestPostingHours[1] && <span><strong>Second-best hour</strong>{new Date(2000, 0, 1, bestPostingHours[1].hour).toLocaleTimeString("en-US", { hour: "numeric" })} · {formatNumber(bestPostingHours[1].averageViews)} avg views</span>}{bestPostingHours.length > 1 && <span><strong>Lowest average</strong>{new Date(2000, 0, 1, bestPostingHours[bestPostingHours.length - 1].hour).toLocaleTimeString("en-US", { hour: "numeric" })} · {formatNumber(bestPostingHours[bestPostingHours.length - 1].averageViews)} avg views</span>}</div>
            <div className="heatmap-scroll"><div className="posting-heatmap"><div className="heatmap-corner" />{Array.from({ length: 24 }, (_, hour) => <span className="heatmap-hour" key={hour}>{hour % 3 === 0 ? new Date(2000, 0, 1, hour).toLocaleTimeString("en-US", { hour: "numeric" }).replace(" ", "") : ""}</span>)}{weekdayNames.map((day) => <div className="heatmap-row" key={day}><span className="heatmap-day">{day.slice(0, 3)}</span>{Array.from({ length: 24 }, (_, hour) => { const cell = postingHeatmap.find((item) => item.day === day && item.hour === hour); const opacity = cell?.count && maxPostingCellViews ? 0.2 + 0.75 * (cell.averageViews / maxPostingCellViews) : 0; return <span className={`heatmap-cell ${cell?.count ? "has-data" : ""}`} key={`${day}-${hour}`} style={cell?.count ? { backgroundColor: `rgba(160, 132, 248, ${opacity})` } : undefined} title={cell?.count ? `${day}, ${hour}:00 · ${cell.count} post${cell.count === 1 ? "" : "s"} · ${formatNumber(cell.averageViews)} average views` : `${day}, ${hour}:00 · no posts recorded`} aria-label={cell?.count ? `${day} ${hour}:00, ${cell.count} posts, ${formatNumber(cell.averageViews)} average views` : `${day} ${hour}:00, no posts recorded`} />; })}</div>)}</div></div>
            <div className="heatmap-legend"><span>Fewer average views</span><i /><i /><i /><i /><span>More average views</span></div>
          </>
        ) : (
          <div className="heatmap-locked"><div className="heatmap-locked-icon"><Activity size={20} /></div><strong>No timestamped post data yet</strong><p>Add post times manually or import a CSV containing <code>date</code>, <code>post_time</code>, and <code>views</code>. Times are interpreted in the selected timezone; results describe your history, not follower activity or a guaranteed best time.</p><Button variant="secondary" onClick={() => setActivePage("Analytics")}>Add post data <ArrowRight size={14} /></Button></div>
        )}
      </div>
      <div className="notice-banner"><ShieldCheck size={16} /><span>Hour and weekday comparisons are simple averages from your records. Small samples and other content differences can affect them; they are not causal or predictive recommendations.</span></div>
    </>
  );

  const renderLibrary = () => (
    <>
      <div className="page-intro"><div><div className="eyebrow">YOUR CREATIVE ARCHIVE</div><h1>Video library</h1><p>Saved file details and categories stay in this browser; the videos themselves are not uploaded.</p></div><Button onClick={showUpload}><Plus size={15} /> Add a video</Button></div>
      <div className="library-toolbar"><div className="data-count">{clips.length} SAVED {clips.length === 1 ? "VIDEO" : "VIDEOS"}</div><span><ShieldCheck size={14} /> LOCAL METADATA ONLY</span></div>
      {clips.length ? <div className="library-grid">{clips.map((clip) => <div className="panel library-card" key={clip.id}><div className="library-preview"><Film size={25} /><span>{clip.category}</span></div><div className="library-card-info"><strong title={clip.name}>{clip.name}</strong><span>{clip.width} × {clip.height} · {formatDuration(clip.duration)} · {formatBytes(clip.size)}</span><small>{clip.status} · Added {new Date(clip.addedAt).toLocaleDateString()}</small></div><button className="icon-button" aria-label="Remove from library" onClick={() => setClips((current) => current.filter((item) => item.id !== clip.id))}><X size={15} /></button></div>)}</div> : <div className="panel library-empty"><div className="empty-library-icon"><FolderOpen size={22} /></div><h2>Your library starts with an edit</h2><p>Add video metadata while inspecting an export. Your original stays on your device.</p><Button onClick={showUpload}><Upload size={14} /> Inspect a video</Button></div>}
    </>
  );

  const renderUploadMethods = () => (
    <>
      <div className="page-intro"><div><div className="eyebrow">PRACTICAL WORKFLOWS, NO MAGIC SETTINGS</div><h1>Upload methods</h1><p>Clear manual workflows for common creator setups.</p></div><span className="local-badge"><ShieldCheck size={14} /> Official app workflows</span></div>
      <div className="guide-layout"><div className="guide-nav">{guides.map((guide, index) => <button className={guideIndex === index ? "active" : ""} key={guide.title} onClick={() => setGuideIndex(index)}><span className="guide-nav-icon">{index === 0 ? <Video size={16} /> : index === 1 ? <Clapperboard size={16} /> : <ShieldCheck size={16} />}</span><span>{guide.title}</span><ChevronRight size={15} /></button>)}</div><div className="panel guide-detail"><div className="guide-kicker">UPLOAD GUIDE · {String(guideIndex + 1).padStart(2, "0")}</div><h2>{guides[guideIndex].title}</h2><p>{guides[guideIndex].detail}</p><div className="guide-steps">{guides[guideIndex].steps.map((step, index) => <div className="guide-step" key={step}><span>{String(index + 1).padStart(2, "0")}</span><p>{step}</p></div>)}</div><div className="notice-banner"><Lightbulb size={16} /><span>Interface names and upload limits can change. Check TikTok’s current documentation and the options available in your account.</span></div></div></div>
      <div className="support-strip guide-support"><span>GENERAL PRINCIPLES</span><strong>Avoid unnecessary re-encoding</strong><strong>Keep the original master</strong><strong>Check sound and framing</strong></div>
    </>
  );

  const renderSettings = () => (
    <>
      <div className="page-intro"><div><div className="eyebrow">MAKE THIS YOUR WORKSPACE</div><h1>Settings</h1><p>Set up your creator profile and editing preferences.</p></div><span className={accountUser && workspaceSyncReady ? "local-badge" : "soft-label"}><ShieldCheck size={14} />{accountUser && workspaceSyncReady ? "Account sync enabled" : "Local workspace"}</span></div>
      <div className="settings-layout">
        <div className="panel settings-card">
          <div className="settings-section-head"><div className="settings-avatar">{(profileName || "C")[0].toUpperCase()}</div><div><h2>Creator onboarding</h2><p>Your profile and working style</p></div></div>
          <label className="field-label">Display name</label>
          <input value={profileName} onChange={(event) => setProfileName(event.target.value)} maxLength={40} placeholder="Your creator name" />
          <label className="field-label">Primary editing category</label>
          <select value={contentCategory} onChange={(event) => setContentCategory(event.target.value)}>{categories.map((category) => <option key={category}>{category}</option>)}</select>
          <label className="field-label">All editing categories you work in</label>
          <select multiple value={preferredCategories} onChange={(event) => setPreferredCategories(Array.from(event.currentTarget.selectedOptions, (option) => option.value))}>{categories.map((category) => <option key={category}>{category}</option>)}</select>
          <p className="settings-help">Select multiple styles with Ctrl-click (Windows) or Command-click (Mac). Preferences are editable any time.</p>
          <label className="field-label">Editing software</label>
          <select value={editingSoftware} onChange={(event) => setEditingSoftware(event.target.value)}><option value="">Select your editor</option>{editingSoftwareOptions.map((software) => <option key={software}>{software}</option>)}</select>
          <label className="field-label">Preferred content style</label>
          <input value={preferredContentStyle} onChange={(event) => setPreferredContentStyle(event.target.value)} maxLength={200} placeholder="e.g. fast cuts, clean motion, rich color" />
          <label className="field-label">Posting frequency goal</label>
          <select value={postingFrequency} onChange={(event) => setPostingFrequency(event.target.value)}><option value="">Choose a goal</option><option>When inspiration strikes</option><option>1 post per week</option><option>2–3 posts per week</option><option>4–5 posts per week</option><option>Daily</option></select>
          <label className="field-label">Target audience location</label>
          <input value={audienceLocation} onChange={(event) => setAudienceLocation(event.target.value)} maxLength={100} placeholder="e.g. United States, global" />
          <label className="field-label">Audience timezone</label>
          <select value={timezone} onChange={(event) => setTimezone(event.target.value)}><option>America/Los_Angeles</option><option>America/New_York</option><option>America/Chicago</option><option>Europe/London</option><option>Europe/Paris</option><option>Asia/Tokyo</option><option>Australia/Sydney</option><option>UTC</option></select>
        </div>
        <div className="panel settings-card settings-notice">
          <div className="settings-section-head"><div className="settings-notice-icon"><ShieldCheck size={17} /></div><div><h2>Account &amp; connections</h2><p>{accountUser ? `Signed in as ${accountUser.email}` : "External services are not configured"}</p></div></div>
          <div className="connection-row"><span>Email and password</span><span className="connection-status">{accountUser ? "Connected" : "Not signed in"}</span></div>
          <div className="connection-row"><span>Account workspace sync</span><span className="connection-status">{accountUser && workspaceSyncReady ? workspaceSyncError ? "Sync issue" : "Enabled" : "Not connected"}</span></div>
          <div className="connection-row"><span>Google / Discord OAuth</span><span className="connection-status">Provider credentials required</span></div>
          <div className="connection-row"><span>TikTok publishing / analytics</span><span className="connection-status">Not connected</span></div>
          <div className="connection-row"><span>Cloud video storage</span><span className="connection-status">Not connected</span></div>
          {accountError && <p className="settings-disclaimer">{accountError}</p>}
          {workspaceSyncError && <p className="settings-disclaimer">{workspaceSyncError}</p>}
          <div className="account-actions">{accountUser ? <Button variant="secondary" onClick={signOut}>Sign out</Button> : <a className="button button-secondary" href="/login">Sign in or create account <ArrowRight size={14} /></a>}</div>
          <div className="settings-disclaimer">Account workspaces sync to PostgreSQL after sign-in. Videos remain local. OAuth, TikTok publishing, cloud video storage, and payments need separate provider setup.</div>
        </div>
      </div>
    </>
  );

  const renderGrowth = () => (
    <>
      <div className="page-intro"><div><div className="eyebrow">BUILD CONSISTENCY, NOT HYPE</div><h1>{activePage}</h1><p>Progress indicators are based on the posts and goals you enter here.</p></div><Button variant="secondary" onClick={() => setActivePage("Analytics")}><BarChart3 size={14} /> View analytics</Button></div>
      <div className="growth-grid"><div className="panel growth-card"><div className="growth-card-icon"><ArrowUpRight size={17} /></div><span>POSTS TRACKED</span><strong>{analytics.length}</strong><small>Recorded by you</small></div><div className="panel growth-card"><div className="growth-card-icon"><Activity size={17} /></div><span>VIEW TREND</span><strong>{sortedAnalytics.length > 1 ? `${sortedAnalytics[sortedAnalytics.length - 1].views >= sortedAnalytics[0].views ? "+" : ""}${formatNumber(sortedAnalytics[sortedAnalytics.length - 1].views - sortedAnalytics[0].views)}` : "—"}</strong><small>{sortedAnalytics.length > 1 ? "Oldest to latest recorded post" : "Add at least two posts to compare"}</small></div><div className="panel growth-card"><div className="growth-card-icon"><CalendarDays size={17} /></div><span>PLANNED POSTS</span><strong>{posts.filter((post) => post.status === "Scheduled").length}</strong><small>On your local content calendar</small></div></div>
      <div className="panel progress-panel"><div className="panel-heading"><div><h2>Milestones & goals</h2><p>Set targets that make sense for your creative schedule.</p></div></div><div className="milestone-row"><span className="milestone-mark"><Check size={14} /></span><div><strong>First analytics milestone</strong><small>Track 5 posts to compare real performance</small></div><span className="milestone-progress">{Math.min(analytics.length, 5)} / 5</span></div><div className="progress-track"><span style={{ width: `${Math.min(analytics.length / 5 * 100, 100)}%` }} /></div><div className="milestone-row"><span className="milestone-mark"><CalendarDays size={14} /></span><div><strong>Content consistency</strong><small>Plan your next post in the calendar</small></div><button className="text-button" onClick={() => setActivePage("Content Calendar")}>Open calendar <ArrowRight size={13} /></button></div><div className="progress-track"><span style={{ width: `${Math.min(posts.filter((post) => post.status === "Scheduled").length / 3 * 100, 100)}%` }} /></div></div>
    </>
  );

  const renderPostingSchedule = () => (
    <>
      <div className="page-intro"><div><div className="eyebrow">PLAN AHEAD, PUBLISH YOURSELF</div><h1>Posting schedule</h1><p>Organize upcoming posts and reminders in your local content calendar.</p></div><Button onClick={() => setActivePage("Content Calendar")}><CalendarDays size={14} /> Open calendar</Button></div>
      <div className="panel schedule-queue"><div className="panel-heading"><div><h2>Upcoming posts</h2><p>Scheduled by you · manual publishing</p></div><span className="data-count">{posts.filter((post) => post.status === "Scheduled").length} PLANNED</span></div>{posts.filter((post) => post.status === "Scheduled").length ? posts.filter((post) => post.status === "Scheduled").map((post) => <div className="queue-row" key={post.id}><div className="queue-date"><strong>{new Date(`${post.date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</strong><span>{post.time}</span></div><div className="queue-title"><strong>{post.title}</strong><span>Manual upload reminder</span></div><span className="queue-status scheduled">Planned</span><button className="icon-button" aria-label="Delete planned post" onClick={() => setPosts((current) => current.filter((item) => item.id !== post.id))}><X size={14} /></button></div>) : <div className="inline-empty"><Clock3 size={18} /><span>Your schedule is clear. Add a reminder in the content calendar.</span><Button variant="secondary" onClick={() => setActivePage("Content Calendar")}>Plan a post</Button></div>}</div>
      <div className="notice-banner"><ShieldCheck size={16} /><span>VIRALFLOW does not have TikTok publishing API access configured. These reminders do not post or upload content automatically.</span></div>
    </>
  );

  const renderFallback = () => (
    <div className="panel coming-soon-panel"><div className="coming-soon-icon"><Sparkles size={20} /></div><div className="eyebrow">CREATOR TOOLKIT</div><h2>{activePage}</h2><p>This workspace is ready for its next integration. Use the local video optimizer, export presets, calendar, captions, hashtag library, and analytics import in the meantime.</p><div className="fallback-actions"><Button variant="secondary" onClick={() => setActivePage("Overview")}>Back to overview <ArrowRight size={14} /></Button><Button onClick={showUpload}><Upload size={14} /> Optimize a video</Button></div><div className="coming-soon-feature"><Check size={14} /> All editing categories supported in the workspace preferences</div><div className="coming-soon-feature"><Check size={14} /> No fabricated TikTok statistics or fake connection status</div></div>
  );

  let content = renderOverview();
  if (activePage === "Optimize video") content = renderVideoTool();
  else if (activePage === "Export Settings") content = renderExportSettings();
  else if (activePage === "Analytics") content = renderAnalytics();
  else if (activePage === "Content Calendar") content = renderCalendar();
  else if (activePage === "Caption Generator") content = renderCaptions();
  else if (activePage === "Hashtag Research") content = renderHashtags();
  else if (activePage === "Best Posting Times") content = renderPostingTimes();
  else if (activePage === "Video Library") content = renderLibrary();
  else if (activePage === "Upload Methods") content = renderUploadMethods();
  else if (activePage === "Settings") content = renderSettings();
  else if (activePage === "Growth Tracker") content = renderGrowth();
  else if (activePage === "Posting Schedule") content = renderPostingSchedule();
  else if (!["Overview"].includes(activePage)) content = renderFallback();

  return (
    <div className={`app-shell ${collapsed ? "sidebar-collapsed" : ""}`}>
      {mobileMenuOpen && <button className="mobile-backdrop" aria-label="Close navigation" onClick={() => setMobileMenuOpen(false)} />}
      <aside className={`sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}>
        <div className="brand-row"><a href="#" className="brand-mark" onClick={(event) => { event.preventDefault(); setActivePage("Optimize video"); }}><span className="brand-symbol"><span /><span /><span /></span><span className="brand-word">VIRAL<span>FLOW</span></span></a><button className="collapse-button" aria-label="Collapse sidebar" onClick={() => setCollapsed((value) => !value)}><Menu size={16} /></button></div>
        <button className="workspace-switcher"><div className="workspace-avatar">V</div><div className="workspace-identity"><strong>{profileName || "Creator"}’s workspace</strong><span>Personal workspace</span></div><ChevronDown size={14} /></button>
        <nav className="sidebar-nav">{navigation.map((group) => <div className="nav-group" key={group.label}><span className="nav-group-label">{group.label}</span>{group.items.map(({ label, icon: Icon }) => <button className={`nav-item ${activePage === label ? "active" : ""}`} key={label} onClick={() => { setActivePage(label); setMobileMenuOpen(false); }} title={collapsed ? label : undefined}><Icon size={16} strokeWidth={1.75} /><span>{label}</span>{label === "Video Library" && clips.length > 0 && <span className="nav-count">{clips.length}</span>}</button>)}</div>)}</nav>
        <div className="sidebar-spacer" />
        <div className="plan-card"><div className="plan-card-top"><span className="plan-orb"><Sparkles size={14} /></span><span className="plan-tag">PRIVATE BY DESIGN</span></div><strong>Optimize on your device.</strong><p>Prepare a clean upload without sending your video to a server.</p><button onClick={() => setActivePage("Settings")}>Workspace settings <ArrowRight size={13} /></button></div>
        <button className="profile-button" onClick={() => setActivePage("Settings")}><div className="profile-avatar">{(profileName || "C")[0].toUpperCase()}</div><div><strong>{profileName || "Creator"}</strong><span>{accountUser?.email ?? "Local workspace"}</span></div><MoreHorizontal size={17} /></button>
      </aside>
      <main className="main-shell">
        <header className="topbar"><div className="topbar-left"><button className="mobile-menu-button" aria-label="Open navigation" onClick={() => setMobileMenuOpen(true)}><Menu size={18} /></button><div className="breadcrumb"><span>Workspace</span><ChevronRight size={13} /><strong>{pageTitle}</strong></div></div><div className="topbar-actions"><div className="topbar-date"><span className="live-dot" /> {today.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</div>{sessionChecked && !accountUser && <a className="topbar-sign-in" href="/login">Sign in</a>}<button className="topbar-icon" aria-label="Search tools" onClick={() => setActivePage("Overview")}><Search size={17} /></button><button className="topbar-icon notification-button" aria-label="Notifications" onClick={() => setToast("You’re all caught up.")}><Bell size={17} /><i /></button><button className="topbar-profile" aria-label={accountUser ? `Signed in as ${accountUser.email}` : "Open settings"} onClick={() => setActivePage("Settings")}>{(profileName || "C")[0].toUpperCase()}</button></div></header>
        <div className="page-content">{content}<footer className="workspace-footer"><span>VIRALFLOW <i>·</i> Local video optimizer</span><span>Files stay on your device · no fake metrics</span></footer></div>
      </main>
      {toast && <div className="toast-message"><Check size={15} />{toast}<button aria-label="Dismiss notification" onClick={() => setToast("")}><X size={14} /></button></div>}
    </div>
  );
}
