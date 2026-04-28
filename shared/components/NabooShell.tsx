"use client";

import {
  ShoppingCart,
  FileText,
  CreditCard,
  Monitor,
  Hotel,
  Package,
  Megaphone,
  MessageSquare,
  ChefHat,
  BedDouble,
  Shield,
  Search,
  Send,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, type ElementType, type ReactNode } from "react";

export type ActiveKey = "participants-rooming-list" | "rooming-list-builder";

interface SubNavItem {
  label: string;
  href?: string;
  activeKey?: ActiveKey;
}

interface NavItem {
  icon: ElementType;
  label: string;
  href?: string;
  activeKey?: ActiveKey;
  parentActiveKeys?: ActiveKey[];
  children?: SubNavItem[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "BOOKING",
    items: [
      { icon: ShoppingCart, label: "Carts" },
      { icon: FileText, label: "My brief" },
    ],
  },
  {
    title: "LEGAL & FINANCE",
    items: [
      { icon: FileText, label: "Documents" },
      { icon: CreditCard, label: "Payments" },
    ],
  },
  {
    title: "ORGANISATION",
    items: [
      {
        icon: Monitor,
        label: "Event website",
        children: [{ label: "Event editor" }, { label: "Forms" }],
      },
      {
        icon: Hotel,
        label: "Accommodation",
        parentActiveKeys: ["participants-rooming-list"],
        children: [
          { label: "Guest list" },
          {
            label: "Rooming list",
            href: "/admin-v2",
            activeKey: "participants-rooming-list",
          },
          { label: "Attachments" },
        ],
      },
      {
        icon: Package,
        label: "Logistics",
        children: [
          { label: "Basic information" },
          { label: "Schedule" },
          { label: "Menus" },
          { label: "Contacts" },
        ],
      },
    ],
  },
  {
    title: "COMMUNICATION",
    items: [
      { icon: Megaphone, label: "Announcements" },
      { icon: MessageSquare, label: "Feedback" },
    ],
  },
  {
    title: "ADMIN",
    items: [
      { icon: ChefHat, label: "Menu builder" },
      {
        icon: BedDouble,
        label: "Rooming list builder",
        href: "/rooming-list-builder",
        activeKey: "rooming-list-builder",
      },
      { icon: Shield, label: "Access & roles" },
    ],
  },
];

export function NabooShell({
  children,
  activeItem,
}: {
  children: ReactNode;
  activeItem?: ActiveKey;
}) {
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (activeItem === "rooming-list-builder" && sidebarRef.current) {
      sidebarRef.current.scrollTo({ top: sidebarRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [activeItem]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white">
      {/* Top header */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-gray-200 shrink-0">
        <svg
          width="70"
          height="22"
          viewBox="0 0 70 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="naboo"
        >
          <path
            d="M12.2895 12.2633V21.2634H8.65264V11.6751C8.65264 9.05741 8.1247 7.76324 6.77548 7.76324C5.22097 7.76324 3.81312 9.41036 3.6078 13.234V21.2634H0.000183105V9.05741C1.37871 8.85156 2.69856 8.11626 3.6078 7.23386V11.8809C4.01843 8.93974 5.30896 7.11621 8.30068 7.11621C10.911 7.11621 12.2602 8.91032 12.2895 12.2633Z"
            fill="#212724"
          />
          <path
            d="M25.6264 11.4103C25.6264 11.3889 25.6264 11.3648 25.6238 11.3434C25.5918 8.59203 23.512 7.14551 19.6137 7.14551C15.4195 7.14551 13.2491 10.0867 15.4488 12.4103H15.5368C15.8301 10.2338 16.8274 7.23374 19.5551 7.26315C21.1682 7.26315 21.9895 8.41025 21.9895 10.5867V13.0867L18.7045 13.4397C15.8008 13.7926 13.7184 15.0868 13.6597 17.4986C13.7184 20.1457 15.5662 21.528 18.5579 21.528C20.8376 21.528 21.7389 20.2286 21.9895 18.6162C22.0002 18.5494 22.0108 18.4798 22.0188 18.4104C22.2188 20.6644 23.4693 21.5147 25.6264 21.5226V18.4745C25.6238 18.2419 25.6238 17.9959 25.6264 17.7338V11.4103ZM21.9895 17.3809C21.9895 19.7927 20.9336 21.1456 19.4378 21.1456C17.9419 21.1456 17.4139 19.2338 17.4139 17.4986C17.4139 15.3221 18.2938 13.675 20.3177 13.4103C20.8749 13.3514 21.4322 13.2633 21.9895 13.2044V17.3809Z"
            fill="#212724"
          />
          <path
            d="M40.6564 14.3237C40.6272 18.7355 38.222 21.5297 35.1717 21.5297C32.6786 21.5297 31.3295 19.0002 30.9482 16.1178V21.2649H27.3405V1.85296C28.719 1.61766 30.0389 0.882362 30.9482 0V12.4119C31.3295 9.38249 32.6786 7.11772 35.1717 7.11772C38.4274 7.11772 40.6272 9.91186 40.6564 14.3237ZM36.9022 14.3237C36.9022 9.94128 35.553 7.64712 34.2624 7.64712C32.6199 7.64712 30.9775 9.85303 30.9775 14.3237C30.9775 18.412 32.6493 21.0002 34.2624 21.0002C35.5823 21.0002 36.9022 18.7061 36.9022 14.3237Z"
            fill="#212724"
          />
          <path
            d="M45.1433 20.5661C43.5973 19.5526 43.9442 17.2083 45.8409 13.1319C47.749 9.02911 49.3176 7.2519 51.0843 7.79076L51.1371 7.67354C48.0186 6.42945 44.0083 7.67543 42.2511 11.453C40.5071 15.206 42.1342 19.0875 45.0887 20.6852L45.1433 20.5661ZM54.6383 17.246C56.3955 13.4685 54.7722 9.5907 51.8196 7.99118L51.763 8.11217C53.3053 9.12559 52.9546 11.47 51.0503 15.569C49.1555 19.6434 47.5887 21.4187 45.8258 20.8837L45.7693 21.0047C48.8896 22.2431 52.8961 20.9972 54.6383 17.246Z"
            fill="#212724"
          />
          <path
            d="M69.2655 17.246C71.0227 13.4685 69.3994 9.5907 66.4468 7.99118L66.3902 8.11217C67.9325 9.12559 67.5818 11.47 65.6775 15.569C63.7827 19.6434 62.2159 21.4187 60.453 20.8837L60.3965 21.0047C63.5168 22.2431 67.5215 20.9953 69.2655 17.246ZM60.4681 13.1319C62.3762 9.02911 63.9448 7.2519 65.7115 7.79076L65.7643 7.67354C62.6458 6.42945 58.6355 7.67543 56.8783 11.453C55.1342 15.206 56.7614 19.0875 59.7159 20.6852L59.7705 20.5661C58.2226 19.5508 58.5714 17.2083 60.4681 13.1319Z"
            fill="#212724"
          />
        </svg>
        <div className="flex items-center gap-5">
          <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            My space
          </button>
          <button className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            🇫🇷 <span>FR</span>
          </button>
          <button className="text-gray-400 hover:text-gray-700 transition-colors">
            <Search size={16} />
          </button>
          <button className="flex items-center gap-2 bg-[#e8f747] text-gray-900 text-sm font-medium px-4 py-2 rounded-full hover:bg-[#ddf03f] transition-colors">
            <Send size={13} />
            Submit a brief
          </button>
          <div className="w-8 h-8 rounded-full bg-[#e8f747] flex items-center justify-center text-xs font-bold text-gray-800 shrink-0">
            GL
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Left sidebar */}
        <aside
          ref={sidebarRef}
          className="w-[280px] shrink-0 border-r border-gray-100 overflow-y-auto flex flex-col bg-white"
        >
          <div className="px-5 pt-6 pb-5">
            <p className="text-sm text-gray-400 mb-3">My advisor</p>
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 shrink-0">
                AD
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">Alexandre Dubois</p>
                <p className="text-xs text-gray-500 mt-0.5">06 35 58 45 69</p>
                <p className="text-xs text-gray-500 truncate">alexandre.dubois@naboo.app</p>
              </div>
            </div>
            <button className="mt-4 w-full text-sm border border-gray-200 rounded-md py-2 text-gray-700 hover:bg-gray-50 transition-colors">
              Book a meeting
            </button>
          </div>

          <nav className="flex-1 pb-4 px-3">
            {NAV_SECTIONS.map((section) => (
              <div key={section.title} className="mb-5">
                <p className="text-sm text-gray-400 px-2 mb-2">
                  {section.title.charAt(0) + section.title.slice(1).toLowerCase()}
                </p>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isParentActive =
                    (item.activeKey && item.activeKey === activeItem) ||
                    !!(
                      item.parentActiveKeys &&
                      activeItem &&
                      item.parentActiveKeys.includes(activeItem)
                    );

                  const itemEl = (
                    <span
                      className={`flex items-center gap-3 px-2 py-2 rounded-md text-sm transition-colors ${
                        isParentActive
                          ? "bg-gray-100 text-gray-900 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Icon size={16} className="shrink-0 text-gray-500" />
                      {item.label}
                    </span>
                  );

                  return (
                    <div key={item.label}>
                      {item.href ? (
                        <Link href={item.href} className="block w-full">
                          {itemEl}
                        </Link>
                      ) : (
                        <div className="w-full cursor-default">{itemEl}</div>
                      )}
                      {item.children && (
                        <div className="ml-[28px] mt-0.5 mb-1">
                          {item.children.map((child) => {
                            const isChildActive = child.activeKey === activeItem;
                            const childEl = (
                              <span
                                className={`block text-sm px-2 py-1.5 rounded-md transition-colors ${
                                  isChildActive
                                    ? "bg-gray-100 text-gray-900 font-medium"
                                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                                }`}
                              >
                                {child.label}
                              </span>
                            );
                            return child.href ? (
                              <Link key={child.label} href={child.href} className="block w-full">
                                {childEl}
                              </Link>
                            ) : (
                              <div key={child.label} className="w-full cursor-default">
                                {childEl}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
