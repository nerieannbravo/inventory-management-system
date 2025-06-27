"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import "@/styles/sidebar.css";

// interface SidebarProps {
//      isCollapsed: boolean;
//      setIsCollapsed: (val: boolean) => void;
//  }

const Sidebar: React.FC = () => {
    const pathname = usePathname();
    const [activeItem, setActiveItem] = useState<string | null>(null);
    const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

    const routeToItem: { [key: string]: string } = {
        '/': 'dashboard',
        '/stock-management': 'stock-management',
        '/request-management': 'request-management',
        '/order-management': 'order-management',
        '/bus-management': 'bus-management',
        '/bus-maintenance': 'bus-maintenance',
        '/machine-equipment-maintenance': 'machine-equipment-maintenance',
        '/bus-disposal': 'bus-disposal',
        '/stock-disposal': 'stock-disposal'
        // '/notification': 'notification',
        // '/history': 'history',
        // '/reports': 'reports'
    };

    // activitySubItems = ['/notification', '/history', '/reports'];
    const maintenanceSubItems = ['/bus-maintenance', '/machine-equipment-maintenance'];
    const disposalSubItems = ['/bus-disposal', '/stock-disposal'];

    // Set activeItem and openSubMenu based on current route
    useEffect(() => {
        const current = routeToItem[pathname];
        setActiveItem(current);

        // Auto-open submenu if current route is a sub-item
        // if (activitySubItems.includes(pathname)) {
        //     setOpenSubMenu('activity-submenu');
        // } else 
        if (maintenanceSubItems.includes(pathname)) {
            setOpenSubMenu('maintenance-submenu');
        } else if (disposalSubItems.includes(pathname)) {
            setOpenSubMenu('disposal-submenu');
        }
    }, [pathname]);

    const toggleSubMenu = (id: string) => {
        setOpenSubMenu(prev => (prev === id ? null : id));
    };

    // const toggleSidebar = () => {
    //     setIsCollapsed(!isCollapsed);
    // };

    // Determine if any subitem in each category is active
    // const isActivityItemActive = activitySubItems.includes(pathname);
    const isMaintenanceItemActive = maintenanceSubItems.includes(pathname);
    const isDisposalItemActive = disposalSubItems.includes(pathname);

    return (
        <div className="sidebar shadow-lg" id="sidebar">
            <div className="sidebar-content">
                <div className="logo-img">
                    <img src="/logo.png" alt="logo" />
                </div>

                <div className="nav-links">
                    <Link
                        href="/"
                        className={`nav-item ${activeItem === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveItem('dashboard')}
                    >
                        <i className="ri-dashboard-line" />
                        <span>Dashboard</span>
                    </Link>

                    <Link
                        href="/stock-management"
                        className={`nav-item ${activeItem === 'stock-management' ? 'active' : ''}`}
                        onClick={() => setActiveItem('stock-management')}
                    >
                        <i className="ri-box-3-line" />
                        <span>Stock Management</span>
                    </Link>

                    <Link
                        href="/request-management"
                        className={`nav-item ${activeItem === 'request-management' ? 'active' : ''}`}
                        onClick={() => setActiveItem('request-management')}
                    >
                        <i className="ri-swap-2-line" />
                        <span>Request Management</span>
                    </Link>

                    <Link
                        href="/order-management"
                        className={`nav-item ${activeItem === 'order-management' ? 'active' : ''}`}
                        onClick={() => setActiveItem('order-management')}
                    >
                        <i className="ri-shopping-cart-2-line" />
                        <span>Order Management</span>
                    </Link>

                    <Link
                        href="/bus-management"
                        className={`nav-item ${activeItem === 'bus-management' ? 'active' : ''}`}
                        onClick={() => setActiveItem('bus-management')}
                    >
                        <i className="ri-bus-line" />
                        <span>Bus Management</span>
                    </Link>

                    {/* Sidebar Maintenance Sub-item */}
                    <div
                        className={`nav-item module ${isMaintenanceItemActive ? 'active' : ''}`}
                        onClick={() => toggleSubMenu('maintenance-submenu')}
                    >
                        <i className="ri-tools-line"></i>
                        <span>Maintenance</span>
                        <i className={`dropdown-arrow ri-arrow-down-s-line ${openSubMenu === 'maintenance-submenu' ? 'rotate' : ''}`} />
                    </div>

                    {openSubMenu === 'maintenance-submenu' && (
                        <div className="sub-menu active">
                            <Link
                                href="/bus-maintenance"
                                className={`sub-item ${activeItem === 'bus-maintenance' ? 'active' : ''}`}
                                onClick={() => setActiveItem('bus-maintenance')}
                            >
                                Bus Maintenance
                            </Link>

                            <Link
                                href="/machine-equipment-maintenance"
                                className={`sub-item ${activeItem === 'machine-equipment-maintenance' ? 'active' : ''}`}
                                onClick={() => setActiveItem('machine-equipment-maintenance')}
                            >
                                Machine & Equipment Maintenance
                            </Link>
                        </div>
                    )}

                    {/* Sidebar Disposal Sub-item */}
                    <div
                        className={`nav-item module ${isDisposalItemActive ? 'active' : ''}`}
                        onClick={() => toggleSubMenu('disposal-submenu')}
                    >
                        <i className="ri-recycle-line" />
                        <span>Disposal</span>
                        <i className={`dropdown-arrow ri-arrow-down-s-line ${openSubMenu === 'disposal-submenu' ? 'rotate' : ''}`} />
                    </div>

                    {openSubMenu === 'disposal-submenu' && (
                        <div className="sub-menu active">
                            <Link
                                href="/bus-disposal"
                                className={`sub-item ${activeItem === 'bus-disposal' ? 'active' : ''}`}
                                onClick={() => setActiveItem('bus-disposal')}
                            >
                                Bus Disposal
                            </Link>

                            <Link
                                href="/stock-disposal"
                                className={`sub-item ${activeItem === 'stock-disposal' ? 'active' : ''}`}
                                onClick={() => setActiveItem('stock-disposal')}
                            >
                                Stock Disposal
                            </Link>
                        </div>
                    )}

                    {/* Sidebar Activities Sub-item */}
                    {/* <div
                        className={`nav-item module ${isActivityItemActive ? 'active' : ''}`}
                        onClick={() => toggleSubMenu('activity-submenu')}
                    >
                        <i className="ri-booklet-line" />
                        <span>Activities</span>
                        <i className={`dropdown-arrow ri-arrow-down-s-line ${openSubMenu === 'activity-submenu' ? 'rotate' : ''}`} />
                    </div>

                    {openSubMenu === 'activity-submenu' && (
                        <div className="sub-menu active">
                            <Link
                                href="/notification"
                                className={`sub-item ${activeItem === 'notification' ? 'active' : ''}`}
                                onClick={() => setActiveItem('notification')}
                            >
                                Notifications
                            </Link>

                            <Link
                                href="/history"
                                className={`sub-item ${activeItem === 'history' ? 'active' : ''}`}
                                onClick={() => setActiveItem('history')}
                            >
                                History
                            </Link>
                        </div>
                    )} */}

                </div>

                <div className="logout">
                    <a href="#">
                        <i className="ri-logout-box-r-line" />
                        <span>Logout</span>
                    </a>
                </div>
            </div>

            {/* <div className="toggle-btn" onClick={toggleSidebar}>
                 <i className="ri-arrow-left-s-line" />
             </div> */}
        </div>
    );
};

export default Sidebar;