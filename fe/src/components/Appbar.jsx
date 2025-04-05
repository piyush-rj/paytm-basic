import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const Appbar = () => {
    const [firstName, setFirstName] = useState("");
    const [showLogout, setShowLogout] = useState(false);
    const navigate = useNavigate();

    const handleProfileClick = () => {
        setShowLogout(!showLogout);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/signin");
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        axios.get("http://localhost:3000/api/v1/user/me", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(response => {
                setFirstName(response.data.firstName);
            })
            .catch(error => {
                console.error("Error fetching user data:", error);
            });
    }, []); // Add empty dependency array to prevent infinite re-renders

    return (
        <div className="shadow h-14 flex justify-between">
            <div className="flex flex-col justify-center h-full ml-4">
                PayTM App
            </div>
            <div className="flex relative">
                <div className="flex flex-col justify-center h-full mr-4">
                    Hello {firstName}
                </div>
                <div 
                    className="rounded-full h-12 w-12 bg-slate-200 flex justify-center mt-1 mr-2 cursor-pointer"
                    onClick={handleProfileClick}
                >
                    <div className="flex flex-col justify-center h-full text-xl">
                        {firstName ? firstName[0].toUpperCase() : "U"}
                    </div>
                </div>
                {showLogout && (
                    <div className="absolute top-14 right-2 mt-1 bg-white shadow-md rounded-md py-2 px-4 z-10">
                        <button 
                            onClick={handleLogout}
                            className="text-red-500 hover:text-red-700"
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};