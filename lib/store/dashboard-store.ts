import { create } from 'zustand'
import type {
  DashboardBootstrapData,
  DashboardClip,
  DashboardProject,
  DashboardUserSummary,
  JobUiStatus,
  VideoService,
} from '@/lib/dashboard/types'

type DashboardStore = {
  projects: DashboardProject[]
  clips: DashboardClip[]
  userSummary: DashboardUserSummary | null
  hydrated: boolean
  hydrateDashboard: (data: DashboardBootstrapData) => void
  hydrateUserSummary: (userSummary: DashboardUserSummary) => void
  setProjects: (projects: DashboardProject[]) => void
  setClips: (clips: DashboardClip[]) => void
  setUserSummary: (userSummary: DashboardUserSummary) => void
  prependProject: (project: DashboardProject) => void
  updateProjectStatus: (projectId: string, status: JobUiStatus, service?: VideoService) => void
  isAccountOpen: boolean
  isBillingOpen: boolean
  isNotificationsOpen: boolean
  setAccountOpen: (open: boolean) => void
  setBillingOpen: (open: boolean) => void
  setNotificationsOpen: (open: boolean) => void
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  projects: [],
  clips: [],
  userSummary: null,
  hydrated: false,
  hydrateDashboard: (data) =>
    set({
      projects: data.projects,
      clips: data.clips,
      hydrated: true,
    }),
  hydrateUserSummary: (userSummary) => set({ userSummary }),
  setProjects: (projects) => set({ projects }),
  setClips: (clips) => set({ clips }),
  setUserSummary: (userSummary) => set({ userSummary }),
  prependProject: (project) =>
    set((state) => ({
      projects: [project, ...state.projects.filter((current) => current.id !== project.id)],
    })),
  updateProjectStatus: (projectId, status, service) =>
    set((state) => ({
      projects: state.projects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              status,
              service: service ?? project.service,
            }
          : project
      ),
    })),
  isAccountOpen: false,
  isBillingOpen: false,
  isNotificationsOpen: false,
  setAccountOpen: (open) => set({ isAccountOpen: open }),
  setBillingOpen: (open) => set({ isBillingOpen: open }),
  setNotificationsOpen: (open) => set({ isNotificationsOpen: open }),
}))

export const useDashboardProjects = () => useDashboardStore((state) => state.projects)
export const useDashboardClips = () => useDashboardStore((state) => state.clips)
export const useDashboardHydrated = () => useDashboardStore((state) => state.hydrated)
export const useDashboardUserSummary = () => useDashboardStore((state) => state.userSummary)
