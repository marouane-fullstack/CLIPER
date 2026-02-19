// Mock data for testing the OpusClip-inspired UI

export type Project = {
  id: string;
  name: string;
  thumbnail: string;
  createdAt: string;
  clipsCount: number;
  status: 'processing' | 'completed' | 'failed';
  duration: string;
  videosUsed: number;
};

// /lib/mock-data.ts
export type ClipStatus = "pending" | "processing" | "uploaded" | "error";

export interface Clip {
  id: string;
  videoId: string;
  startTime: number;
  endTime: number;
  reason?: string;
  captionSrt?: string;
  cloudinaryUrl?: string;
  createdAt: string;
  updatedAt: string;
  status: ClipStatus;
  thumbnail: string; // added for UI display
  duration: string;  // added for UI display
  name: string;      // added for UI display
  progress?: number; // optional progress %
}

export const mockRecentClipsLo: Clip[] = [
  {
    id: "clip_001",
    videoId: "vid_001",
    startTime: 0,
    endTime: 12,
    reason: "Exciting intro",
    captionSrt: "intro.srt",
    cloudinaryUrl: "https://cloudinary-marketing-res.cloudinary.com/video/upload/ar_1,c_fill,h_185,w_354,g_auto/Cloudinary_API_Sizzle_HiBand_new.mp4",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "uploaded",
    thumbnail: "https://cloudinary-marketing-res.cloudinary.com/video/upload/ar_1,c_fill,h_185,w_354,g_auto/Cloudinary_API_Sizzle_HiBand_new.mp4",
    duration: "00:12",
    name: "Epic Intro Scene",
  },
  {
    id: "clip_002",
    videoId: "vid_002",
    startTime: 13,
    endTime: 27,
    reason: "Funny moment",
    cloudinaryUrl: "https://cloudinary-marketing-res.cloudinary.com/video/upload/ar_1,c_fill,h_185,w_354,g_auto/Cloudinary_API_Sizzle_HiBand_new.mp4",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "processing",
    thumbnail: "https://res.cloudinary.com/demo/video/upload/v1690000000/clip2_thumb.jpg",
    duration: "00:14",
    name: "Hilarious Hoodie Trend",
    progress: 45,
  },
  {
    id: "clip_003",
    videoId: "vid_003",
    startTime: 28,
    endTime: 40,
    reason: "Crazy stunt",
    cloudinaryUrl: "https://cloudinary-marketing-res.cloudinary.com/video/upload/ar_1,c_fill,h_185,w_354,g_auto/Cloudinary_API_Sizzle_HiBand_new.mp4",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "pending",
    thumbnail: "https://res.cloudinary.com/demo/video/upload/v1690000000/clip3_thumb.jpg",
    duration: "00:12",
    name: "Sherp Saves the Day!",
  },
  {
    id: "clip_004",
    videoId: "vid_004",
    startTime: 41,
    endTime: 55,
    reason: "Inspiring moment",
    cloudinaryUrl: "https://cloudinary-marketing-res.cloudinary.com/video/upload/ar_1,c_fill,h_185,w_354,g_auto/Cloudinary_API_Sizzle_HiBand_new.mp4",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "error",
    thumbnail: "https://res.cloudinary.com/demo/video/upload/v1690000000/clip4_thumb.jpg",
    duration: "00:14",
    name: "From Homeless to $150M",
  },
  {
    id: "clip_005",
    videoId: "vid_005",
    startTime: 56,
    endTime: 68,
    reason: "Unexpected purchase",
    cloudinaryUrl: "https://cloudinary-marketing-res.cloudinary.com/video/upload/ar_1,c_fill,h_185,w_354,g_auto/Cloudinary_API_Sizzle_HiBand_new.mp4",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "uploaded",
    thumbnail: "https://res.cloudinary.com/demo/video/upload/v1690000000/clip5_thumb.jpg",
    duration: "00:12",
    name: "He Bought a TOWN?!",
  },
];




export type TranscriptLine = {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  speaker?: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  quotaVideosUsed: number;
  quotaVideosLimit: number;
  quotaClipsUsed: number;
  quotaClipsLimit: number;
};

// Mock Projects
export const mockProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'AI Basics Tutorial',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=400&h=200&fit=crop',
    createdAt: '2024-02-15',
    clipsCount: 12,
    status: 'completed',
    duration: '45:32',
    videosUsed: 1,
  },
  {
    id: 'proj-2',
    name: 'Marketing Strategy 2024',
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=200&fit=crop',
    createdAt: '2024-02-10',
    clipsCount: 8,
    status: 'completed',
    duration: '32:15',
    videosUsed: 1,
  },
  {
    id: 'proj-3',
    name: 'Quarterly Review Meeting',
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=200&fit=crop',
    createdAt: '2024-02-05',
    clipsCount: 5,
    status: 'processing',
    duration: '28:45',
    videosUsed: 1,
  },
];



// Mock Transcript
export const mockTranscript: TranscriptLine[] = [
  {
    id: 't-1',
    text: 'Welcome everyone to our AI tutorial. Today we\'ll explore the fundamentals of machine learning.',
    startTime: 0,
    endTime: 5,
    speaker: 'Instructor',
  },
  {
    id: 't-2',
    text: 'Machine learning is a subset of artificial intelligence that enables systems to learn from data.',
    startTime: 5,
    endTime: 12,
    speaker: 'Instructor',
  },
  {
    id: 't-3',
    text: 'Unlike traditional programming, ML systems improve their performance through experience.',
    startTime: 12,
    endTime: 19,
    speaker: 'Instructor',
  },
  {
    id: 't-4',
    text: 'There are three main types of machine learning: supervised, unsupervised, and reinforcement learning.',
    startTime: 19,
    endTime: 28,
    speaker: 'Instructor',
  },
  {
    id: 't-5',
    text: 'Supervised learning involves training on labeled data. For example, predicting house prices based on features.',
    startTime: 28,
    endTime: 38,
    speaker: 'Instructor',
  },
  {
    id: 't-6',
    text: 'Unsupervised learning finds patterns in unlabeled data, like customer segmentation.',
    startTime: 38,
    endTime: 45,
    speaker: 'Instructor',
  },
];

// Mock User
export const mockUser: User = {
  id: 'user-1',
  name: 'Sarah Johnson',
  email: 'sarah@example.com',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
  quotaVideosUsed: 8,
  quotaVideosLimit: 20,
  quotaClipsUsed: 45,
  quotaClipsLimit: 100,
};


