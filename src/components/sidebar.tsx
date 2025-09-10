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
        '/stock-in': 'stock-in',
        '/stock-out': 'stock-out',
        '/bus-management': 'bus-management',
        '/item-management': 'item-management',
        '/supplier-management': 'supplier-management',
        '/request-management': 'request-management',
        '/budget-request': 'budget-request',
        '/order-management': 'order-management',
        '/bus-maintenance': 'bus-maintenance',
        '/machine-equipment-maintenance': 'machine-equipment-maintenance',
        '/bus-disposal': 'bus-disposal',
        '/stock-disposal': 'stock-disposal',
        '/notification': 'notification',
        '/history': 'history',
        '/reports': 'reports'
    };

    const stockSubItems = ['/stock-in', '/stock-out'];
    // const activitySubItems = ['/notification', '/history', '/reports'];
    const maintenanceSubItems = ['/bus-maintenance', '/machine-equipment-maintenance'];
    const disposalSubItems = ['/bus-disposal', '/stock-disposal'];

    // Set activeItem and openSubMenu based on current route
    useEffect(() => {
        const current = routeToItem[pathname];
        setActiveItem(current);

        // Auto-open submenu if current route is a sub-item
        if (stockSubItems.includes(pathname)) {
            setOpenSubMenu('stock-submenu');
            // } else if (activitySubItems.includes(pathname)) {
            //     setOpenSubMenu('activity-submenu');
        } else if (maintenanceSubItems.includes(pathname)) {
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
    const isStockItemActive = stockSubItems.includes(pathname);
    // const isActivityItemActive = activitySubItems.includes(pathname);
    const isMaintenanceItemActive = maintenanceSubItems.includes(pathname);
    const isDisposalItemActive = disposalSubItems.includes(pathname);

    return (
        <div className="sidebar shadow-lg" id="sidebar">
            <div className="logo-img">
                <img src="/logo.png" alt="logo" />
            </div>

            <div className="sidebar-content">
                <div className="nav-links">
                    <Link
                        href="/"
                        className={`nav-item ${activeItem === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveItem('dashboard')}
                    >
                        <i className="ri-dashboard-line" />
                        <span>Dashboard</span>
                    </Link>

                    {/* Sidebar Stock Sub-item */}
                    <div
                        className={`nav-item module ${isStockItemActive ? 'active' : ''}`}
                        onClick={() => toggleSubMenu('stock-submenu')}
                    >
                        <i className="ri-archive-line" />
                        <span>Stock Management</span>
                        <i className={`dropdown-arrow ri-arrow-down-s-line ${openSubMenu === 'stock-submenu' ? 'rotate' : ''}`} />
                    </div>

                    {openSubMenu === 'stock-submenu' && (
                        <div className="sub-menu active">
                            <Link
                                href="/stock-in"
                                className={`sub-item ${activeItem === 'stock-in' ? 'active' : ''}`}
                                onClick={() => setActiveItem('stock-in')}
                            >
                                Stock In
                            </Link>

                            <Link
                                href="/stock-out"
                                className={`sub-item ${activeItem === 'stock-out' ? 'active' : ''}`}
                                onClick={() => setActiveItem('stock-out')}
                            >
                                Stock Out
                            </Link>
                        </div>
                    )}

                    <Link
                        href="/bus-management"
                        className={`nav-item ${activeItem === 'bus-management' ? 'active' : ''}`}
                        onClick={() => setActiveItem('bus-management')}
                    >
                        <i className="ri-bus-line" />
                        <span>Bus Management</span>
                    </Link>

                    <Link
                        href="/item-management"
                        className={`nav-item ${activeItem === 'item-management' ? 'active' : ''}`}
                        onClick={() => setActiveItem('item-management')}
                    >
                        <i className="ri-box-3-line" />
                        <span>Item Management</span>
                    </Link>

                    <Link
                        href="/supplier-management"
                        className={`nav-item ${activeItem === 'supplier-management' ? 'active' : ''}`}
                        onClick={() => setActiveItem('supplier-management')}
                    >
                        <i className="ri-shopping-basket-line" />
                        <span>Supplier Management</span>
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
                        href="/budget-request"
                        className={`nav-item ${activeItem === 'budget-request' ? 'active' : ''}`}
                        onClick={() => setActiveItem('budget-request')}
                    >
                        <i className="ri-hand-coin-line" />
                        <span> Budget Request</span>
                    </Link>

                    <Link
                        href="/order-management"
                        className={`nav-item ${activeItem === 'order-management' ? 'active' : ''}`}
                        onClick={() => setActiveItem('order-management')}
                    >
                        <i className="ri-shopping-cart-2-line" />
                        <span>Order Management</span>
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