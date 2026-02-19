import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./_components/AppSidebar";
import { Separator } from "@/components/ui/separator";
import BreadcrumbCurrentPath from "./_components/breadcrumbCurrentPath";




export default function DashboardLayout ({children}:Readonly<{children:React.ReactNode}>)  {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset  className="flex flex-col h-screen overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <BreadcrumbCurrentPath/>
          </div>
        </header>
          <div className="flex-1 overflow-hidden pt-0">
    <div className="h-full p-4 overflow-y-auto scroll-area">
      {children}
    </div>
  </div>
      </SidebarInset>
    </SidebarProvider>
  );
};
