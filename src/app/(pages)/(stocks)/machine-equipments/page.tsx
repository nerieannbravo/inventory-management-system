"use client";

import MoreMenu from "@/components/moreMenu";

export default function MachineEquipment() {
    return (
        <div className="card">
            <h1 className="title">
                Machine and Equipments
            </h1>

            <div className="elements">
                <div className="entries">
                    <div className="search">
                        <input type="text" placeholder="Search" />
                        <button>
                            <i className="ri-search-line"></i>
                        </button>
                    </div>

                    <div className="filter">
                        <select className="status-filter">
                            <option value="all">All Categories</option>
                        </select>

                        <select className="status-filter">
                            <option value="all">All Status</option>
                            <option value="available">Available</option>
                            <option value="outstock">Out of Stock</option>
                            <option value="lowstock">Low Stock</option>
                            <option value="maintenance">Under Maintenance</option>
                        </select>
                    </div>


                    <button className="main-btn">
                        <i className="ri-add-line"></i>
                        Add Stocks
                    </button>
                </div>

                
            </div>


        </div>
    );
}