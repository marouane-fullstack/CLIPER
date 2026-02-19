'use client';

import { Fragment, useState } from 'react';
import Link from 'next/link';
import { mockProjects, mockClips } from '@/lib/mock-data';
import { ArrowLeft, Download, RefreshCw, Play, Clock, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function VideoPage({ params }: { params: { id: string } }) {
  const [selectedClipId, setSelectedClipId] = useState<string | null>(mockClips[0].id);
  const [showMobileDetails, setShowMobileDetails] = useState(false);
  
  // Get project and its clips
  const project = mockProjects.find(p => p.id === params.id) || mockProjects[0];
  const projectClips = mockClips.filter(c => c.projectId === project.id);
  const selectedClip = projectClips.find(c => c.id === selectedClipId);
  const completedClips = projectClips.filter(c => c.status === 'completed').length;
  const projectProgress = Math.round((completedClips / projectClips.length) * 100);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-400';
      case 'processing':
        return 'bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-400';
      case 'queued':
        return 'bg-blue-500/15 text-blue-700 border-blue-500/30 dark:text-blue-400';
      case 'error':
        return 'bg-red-500/15 text-red-700 border-red-500/30 dark:text-red-400';
      default:
        return 'bg-neutral-500/15 text-neutral-700 border-neutral-500/30 dark:text-neutral-400';
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500';
      case 'processing':
        return 'bg-gradient-to-r from-amber-400 via-orange-400 to-orange-500';
      case 'queued':
        return 'bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500';
      case 'error':
        return 'bg-gradient-to-r from-red-400 via-rose-400 to-red-500';
      default:
        return 'bg-gradient-to-r from-neutral-400 to-stone-500';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors -ml-2 px-2 py-1 rounded-lg hover:bg-accent"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Back</span>
          </Link>
          <div className="text-center flex-1 mx-4">
            <h1 className="text-base md:text-lg font-bold text-foreground text-balance">{project.name}</h1>
            <p className="text-xs text-muted-foreground">{projectClips.length} clips generated</p>
          </div>
          <div className="w-8" />
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Original Video */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-6">
              {/* Video Player */}
              <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="aspect-video bg-black relative group overflow-hidden">
                  <img
                    src={project.thumbnail}
                    alt={project.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center hover:bg-white/30">
                      <Play className="w-5 h-5 text-white fill-white" />
                    </div>
                  </div>
                </div>

                {/* Video Info */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-foreground text-sm">{project.name}</h3>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                      {project.status === 'completed' ? 'Done' : 'Processing'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{project.duration}</span>
                  </div>

                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Progress</p>
                    <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                      <div className={`h-full ${getProgressColor(project.status)} transition-all duration-500`} style={{ width: '100%' }}></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Transcribed & Ready</p>
                  </div>
                </div>
              </div>

              {/* Quota Indicator */}
              <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                <h4 className="font-medium text-sm text-foreground">Quota Usage</h4>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-muted-foreground">Videos</span>
                      <span className="text-xs font-medium text-foreground">8/20</span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: '40%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-muted-foreground">Clips</span>
                      <span className="text-xs font-medium text-foreground">45/100</span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Clips Grid */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">Generated Clips</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                  {projectClips.map((clip) => (
                    <button 
                     suppressHydrationWarning
                      key={clip.id}
                      onClick={() => setSelectedClipId(clip.id)}
                      className={`bg-card border rounded-xl overflow-hidden transition-all duration-200 hover:border-primary/50 hover:shadow-md text-left ${
                        selectedClipId === clip.id ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                      }`}
                    >
                      {/* Thumbnail */}
                      <div className="relative aspect-video bg-black overflow-hidden group">
                        <Image
                        fill
                          src={clip.thumbnail}
                          alt={clip.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        
                        {/* Status Badge */}
                        <div className="absolute top-2 right-2">
                          <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(clip.status)}`}>
                            {clip.status === 'completed' ? 'Done' : clip.status === 'processing' ? `${clip.progress}%` : clip.status === 'queued' ? 'Queued' : 'Error'}
                          </span>
                        </div>

                        {/* Play Icon Overlay */}
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                            <Play className="w-4 h-4 text-white fill-white" />
                          </div>
                        </div>

                        {/* Duration */}
                        <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs font-medium text-white">
                          {clip.duration}
                        </div>
                      </div>

                      {/* Info Section */}
                      <div className="p-4 space-y-3">
                        <h3 className="font-medium text-sm text-foreground leading-tight">{clip.name}</h3>

                        {/* Progress Bar */}
                        {clip.status !== 'completed' && (
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-muted-foreground capitalize">{clip.stage.replace(/_/g, ' ')}</span>
                              <span className="text-xs font-medium text-foreground">{clip.progress}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className={`h-full ${getProgressColor(clip.status)} transition-all duration-500`} style={{ width: `${clip.progress}%` }}></div>
                            </div>
                            {clip.eta && (
                              <p className="text-xs text-muted-foreground">ETA: {clip.eta}</p>
                            )}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          {clip.status === 'completed' && (
                            <Button className="flex-1 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-1">
                              <Download className="w-3 h-3" />
                              Download
                            </Button>
                          )}
                          {clip.status === 'error' && (
                            <Button className="flex-1 px-3 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-medium hover:bg-red-500/30 transition-colors flex items-center justify-center gap-1">
                              <RefreshCw className="w-3 h-3" />
                              Retry
                            </Button>
                          )}
                          {clip.status === 'processing' && (
                            <div className="flex-1 px-3 py-2 bg-muted rounded-lg text-xs font-medium text-muted-foreground text-center">
                              Processing...
                            </div>
                          )}
                          {clip.status === 'queued' && (
                            <div className="flex-1 px-3 py-2 bg-muted rounded-lg text-xs font-medium text-muted-foreground text-center">
                              In Queue
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Clip Details Panel (Mobile) */}
      {selectedClip && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 max-h-48 overflow-y-auto">
          <h3 className="font-medium text-foreground mb-2">{selectedClip.name}</h3>
          <p className="text-sm text-muted-foreground mb-4">{selectedClip.duration} • {selectedClip.status}</p>
          {selectedClip.status === 'completed' && (
            <Button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              Download
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
