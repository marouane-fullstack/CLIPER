'use client'


import { useUser } from '@clerk/nextjs'
import WordMark from './_components/wordMark'
import ProjectsSection from './_components/ProjectsSection'
import Uploader from './_components/Uploader'
import ClipsSection from './_components/ClipsSection'

const mockProjects = [
  {
    id: "proj_001",
    title: "Summer Vibes Promo",
    originalUrl: "https://youtu.be/TI_pZD-FtBU?si=pzb8PrAUNDyRi9sk", // sample video
    status: "Processing",
  },
  {
    id: "proj_002",
    title: "Tech Talk Highlights",
    originalUrl: "https://youtu.be/0uas6lCkC_Q?si=LnzrsXc1bdYcY-ET",
    status: "Completed",
  },
  {
    id: "proj_003",
    title: "Gaming Montage",
    originalUrl: "https://youtu.be/o4UC3UUvXBw?si=akCLp3hijGPSqODF",
    status: "Failed",
  },
  {
    id: "proj_004",
    title: "Art Showcase",
    originalUrl: "https://youtu.be/q3ugcaBTaQc?si=VOa1zKcicadPPRHf",
    status: "Processing",
  },
  {
    id: "proj_005",
    title: null, // will fallback to "Untitled project"
    originalUrl: "https://youtu.be/Ae6YLY1b4IA?si=F7vN793R9HBOPr-h",
    status: "Completed",
  },
];

export default function Dashboard() {

  const {user} = useUser();

  return (
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-auto">
          <div className="sm:p-4 md:p-6 lg:p-8">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Welcome back, <span className='text-destructive'>{user?.fullName?.toUpperCase() || ([user?.firstName,user?.lastName].join(" ").toUpperCase())}</span>!</h1>
              <Uploader/>
              <WordMark/>
            </div>

            {/* Projects Section */}
            <ProjectsSection projects={mockProjects}/>

            {/* Recent Clips Section */}
            <ClipsSection/>
          </div>
        </main>
      </div>
  )
}
