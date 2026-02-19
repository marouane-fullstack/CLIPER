'use client';

import { usePathname } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { data } from './AppSidebar';

export default function BreadcrumbCurrentPath() {
  const pathname = usePathname(); // e.g., /dashboard/projects
  const pathSegments = pathname.split('/').filter(Boolean); // ['dashboard', 'projects']

  // build breadcrumb items
  const breadcrumbItems = pathSegments.map((segment, idx) => {
    // reconstruct the path up to this segment
    const url = '/' + pathSegments.slice(0, idx + 1).join('/');

    // find nav item title if exists
    const navItem = data.navMain.find(item => item.url === url);
    const title = navItem ? navItem.title : segment.charAt(0).toUpperCase() + segment.slice(1);

    // last item -> BreadcrumbPage (current page), others -> BreadcrumbLink
    const isLast = idx === pathSegments.length - 1;

    return (
      <BreadcrumbItem key={url} className={isLast ? "" : "hidden md:block"}>
        {isLast ? (
          <BreadcrumbPage>{title}</BreadcrumbPage>
        ) : (
          <BreadcrumbLink href={url}>{title}</BreadcrumbLink>
        )}
      </BreadcrumbItem>
    );
  });

  // add separators
  const breadcrumbWithSeparators = breadcrumbItems.reduce((acc: any[], item, index) => {
    if (index > 0) {
      acc.push(
        <BreadcrumbSeparator key={`sep-${index }`} className="hidden  md:block" />
      );
    }
    acc.push(item);
    return acc;
  }, []);

  return (
    <Breadcrumb>
      <BreadcrumbList className='text-destructive'>{breadcrumbWithSeparators}</BreadcrumbList>
    </Breadcrumb>
  );
}