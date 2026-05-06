import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "../supabaseClient";

export default function Dashboard() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/");
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Auto Apply Dashboard</h1>
                <Button variant="outline" onClick={handleLogout}>Logout</Button>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div className="border p-4 rounded-lg shadow-sm">
                    <p className="text-muted-foreground">Total Applied</p>
                    <p className="text-2xl font-bold">0</p>
                </div>
                <div className="border p-4 rounded-lg shadow-sm">
                    <p className="text-muted-foreground">Awaiting Review</p>
                    <p className="text-2xl font-bold text-blue-600">0</p>
                </div>
                <div className="border p-4 rounded-lg shadow-sm">
                    <p className="text-muted-foreground">Interviews</p>
                    <p className="text-2xl font-bold text-green-600">0</p>
                </div>
            </div>
            <div>
                <h2 className="text-xl font-bold mb-4">Pending AI Approvals</h2>
                <div className="border p-12 rounded-xl flex flex-col items-center justify-center text-muted-foreground text-center">
                    <p>No jobs pending review right now.</p>
                    <p className="text-sm mt-2">Your Python agent will send jobs here automatically.</p>
                </div>
            </div>
        </div>
    );
}
