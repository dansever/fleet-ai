import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from '@/components/ui/breadcrumb';

interface Breadcrumb {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function AppBreadcrumbs({ breadcrumbs }: { breadcrumbs: Breadcrumb[] }) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((breadcrumb, index) => {
          const IconComponent = breadcrumb.icon;
          return (
            <BreadcrumbItem key={index}>
              <BreadcrumbLink
                href={breadcrumb.href}
                className="flex flex-row items-center gap-2"
              >
                <span className="w-4 h-4 shrink-0 flex items-center justify-center">
                  <IconComponent className="w-4 h-4" />
                </span>
                <span className="leading-none">{breadcrumb.label}</span>
              </BreadcrumbLink>
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
