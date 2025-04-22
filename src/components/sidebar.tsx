'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

// interface SidebarProps {
//     isCollapsed: boolean;
//     setIsCollapsed: (val: boolean) => void;
// }

// const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
const Sidebar: React.FC = () => {
    const pathname = usePathname();
    const [activeItem, setActiveItem] = useState<string | null>(null);
    const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

    const routeToItem: { [key: string]: string } = {
        '/': 'dashboard',
        '/consumables': 'consumables',
        '/machine-equipments': 'machines',
        '/request-management': 'request-management',
        '/order-management': 'order-management',
        '/bus-management': 'bus-management',
    };

    const stockSubItems = ['/consumables', '/machine-equipments'];

    // Set activeItem only on route change
    useEffect(() => {
        const current = routeToItem[pathname] || null;
        setActiveItem(current);
    }, [pathname]);

    const toggleSubMenu = (id: string) => {
        setOpenSubMenu(prev => (prev === id ? null : id));
    };

    // const toggleSidebar = () => {
    //     setIsCollapsed(!isCollapsed);
    // };

    // Determine if a stock subitem is active
    const isStockItemActive = stockSubItems.includes(pathname);

    return (
        // <div className={`sidebar ${isCollapsed ? 'collapsed' : ''} shadow-lg`} id="sidebar">
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

                    <div
                        className={`nav-item module ${isStockItemActive ? 'active' : ''}`}
                        onClick={() => toggleSubMenu('stock-submenu')}
                    >
                        <i className="ri-box-3-line" />
                        <span>Stock Management</span>
                        <i className={`dropdown-arrow ri-arrow-down-s-line ${openSubMenu === 'stock-submenu' ? 'rotate' : ''}`} />
                    </div>

                    {openSubMenu === 'stock-submenu' && (
                        <div className="sub-menu active">
                            <Link
                                href="/consumables"
                                className={`sub-item ${activeItem === 'consumables' ? 'active' : ''}`}
                                onClick={() => setActiveItem('consumables')}
                            >
                                Consumable Stocks
                            </Link>
                            <Link
                                href="/machine-equipments"
                                className={`sub-item ${activeItem === 'machines' ? 'active' : ''}`}
                                onClick={() => setActiveItem('machines')}
                            >
                                Machines and Equipments
                            </Link>
                        </div>
                    )}

                    <Link
                        href="/request-management"
                        className={`nav-item ${activeItem === 'request-management' ? 'active' : ''}`}
                        onClick={() => setActiveItem('request-management')}
                    >
                        <i className="ri-tools-line" />
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
