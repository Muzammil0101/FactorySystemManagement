"use client";
import { useState, useEffect } from "react";
import {
    Shield,
    Key,
    Activity,
    Clock,
    Smartphone,
    Globe,
    CheckCircle,
    AlertCircle,
    Lock,
    User,
    Download
} from "lucide-react";


const API_URL = "http://localhost:4000/api";

export default function ProfilePage() {
    const [logs, setLogs] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(true);

    const [passForm, setPassForm] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [passLoading, setPassLoading] = useState(false);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const res = await fetch(`${API_URL}/auth/logs`);
            if (res.ok) {
                const data = await res.json();
                setLogs(data);
            }
        } catch (error) {
            console.error("Error fetching logs", error);
        } finally {
            setLoadingLogs(false);
        }
    };

    const handlePassChange = (e) => {
        setPassForm({ ...passForm, [e.target.name]: e.target.value });
    };

    const showNotification = (message, type = "success") => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const submitPasswordChange = async (e) => {
        e.preventDefault();
        if (passForm.newPassword !== passForm.confirmPassword) {
            showNotification("New passwords do not match", "error");
            return;
        }
        if (!passForm.oldPassword) {
            showNotification("Please enter your old password", "error");
            return;
        }

        setPassLoading(true);
        try {
            const email = localStorage.getItem("userEmail"); // Assuming email is stored
            const res = await fetch(`${API_URL}/auth/change-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    oldPassword: passForm.oldPassword,
                    newPassword: passForm.newPassword
                })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                showNotification("Password changed successfully", "success");
                setPassForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
            } else {
                showNotification(data.message || "Failed to change password", "error");
            }
        } catch (error) {
            showNotification("Server error encountered", "error");
        } finally {
            setPassLoading(false);
        }
    };

    const handleDownloadBackup = async () => {
        try {
            const res = await fetch(`${API_URL}/backup/download`);
            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `facsys_backup_${new Date().toISOString().split('T')[0]}.db`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                showNotification("Backup downloaded successfully", "success");
            } else {
                showNotification("Failed to download backup", "error");
            }
        } catch (error) {
            console.error("Download error:", error);
            showNotification("Error downloading backup", "error");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans relative overflow-hidden">

            {/* Background Ambient Glows */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-200/40 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2 pointer-events-none"></div>



            <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">

                {/* Header */}
                <div className="mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
                            <span className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-200 text-white">
                                <Shield size={24} />
                            </span>
                            Admin Profile
                        </h1>
                        <p className="text-slate-500 mt-2 text-sm font-semibold ml-1">Manage security & view access logs</p>
                    </div>
                </div>

                {/* Notification Toast */}
                {notification && (
                    <div className={`fixed top-24 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-xl border border-white/40 animate-slide-in ${notification.type === "success"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}>
                        {notification.type === "success" ? <CheckCircle size={20} className="text-emerald-500" /> : <AlertCircle size={20} className="text-rose-500" />}
                        <p className="font-bold text-sm">{notification.message}</p>
                    </div>
                )}

                <div className="grid lg:grid-cols-3 gap-8">

                    {/* Column 1: Password Change (1/3 width) */}
                    <div className="lg:col-span-1">
                        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl shadow-slate-200/50 sticky top-28">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-purple-100 rounded-xl text-purple-600">
                                    <Key size={20} />
                                </div>
                                <h2 className="text-lg font-bold text-slate-800">Change Password</h2>
                            </div>

                            <form onSubmit={submitPasswordChange} className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Current Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                        <input
                                            type="password"
                                            name="oldPassword"
                                            value={passForm.oldPassword}
                                            onChange={handlePassChange}
                                            placeholder="••••••••"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">New Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                        <input
                                            type="password"
                                            name="newPassword"
                                            value={passForm.newPassword}
                                            onChange={handlePassChange}
                                            placeholder="••••••••"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Confirm New</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={passForm.confirmPassword}
                                            onChange={handlePassChange}
                                            placeholder="••••••••"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={passLoading}
                                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-purple-200 transition-all mt-2 flex items-center justify-center gap-2"
                                >
                                    {passLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Update Password"}
                                </button>
                            </form>
                        </div>


                        {/* System Maintenance Section */}
                        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl shadow-slate-200/50 mt-6 sticky top-[500px]">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
                                    <Shield size={20} />
                                </div>
                                <h2 className="text-lg font-bold text-slate-800">System Maintenance</h2>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <h3 className="text-sm font-bold text-slate-700 mb-1">Data Backup</h3>
                                    <p className="text-xs text-slate-500 mb-4">Download a copy of your database for safe keeping.</p>

                                    <button
                                        onClick={handleDownloadBackup}
                                        className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 group"
                                    >
                                        <Download size={16} className="text-slate-400 group-hover:text-purple-600 transition-colors" />
                                        Download Backup
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Activity Logs (2/3 width) */}
                    <div className="lg:col-span-2">
                        <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-3xl p-6 shadow-xl shadow-slate-200/50">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                                        <Activity size={20} />
                                    </div>
                                    <h2 className="text-lg font-bold text-slate-800">Recent Login Activity</h2>
                                </div>
                                <div className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-500 border border-slate-200">
                                    Last 50 logins
                                </div>
                            </div>

                            <div className="overflow-hidden rounded-xl border border-slate-100">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                            <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Time</th>
                                            <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">IP Address</th>
                                            <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                                            <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {loadingLogs ? (
                                            <tr>
                                                <td colSpan="4" className="px-5 py-8 text-center text-slate-400 text-sm">Loading activity logs...</td>
                                            </tr>
                                        ) : logs.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="px-5 py-8 text-center text-slate-400 text-sm italic">No login activity recorded yet.</td>
                                            </tr>
                                        ) : (
                                            logs.map((log) => (
                                                <tr key={log.id} className="hover:bg-blue-50/50 transition-colors">
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <Clock size={16} className="text-slate-400" />
                                                            <span className="text-sm font-semibold text-slate-700">
                                                                {new Date(log.login_time).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <Globe size={16} className="text-slate-400" />
                                                            <span className="text-sm font-mono text-slate-600">{log.ip_address}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <User size={16} className="text-slate-400" />
                                                            <span className="text-sm font-medium text-slate-600">{log.email}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4 text-right">
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                            Success
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
