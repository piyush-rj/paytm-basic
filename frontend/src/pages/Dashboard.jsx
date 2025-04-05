// In Dashboard.jsx
import { useEffect, useState } from "react";
import { Appbar } from "../components/Appbar";
import { Balance } from "../components/Balance";
import { Users } from "../components/Users";
import axios from "axios";

export const Dashboard = () => {
    const [balance, setBalance] = useState("");
    const [userId, setUserId] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) return;

        // Get balance
        axios.get("http://localhost:3000/api/v1/account/balance", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then(res => {
            setBalance(res.data.balance);
        });

        // Decode token to get userId (or you can hit a /me endpoint if you have one)
        const base64Payload = token.split('.')[1];
        const payload = JSON.parse(atob(base64Payload));
        setUserId(payload.userId);
    }, []);

    return (
        <div>
            <Appbar />
            <div className="m-8">
                <Balance value={balance} />
                <Users currentUserId={userId} />
            </div>
        </div>
    );
};
