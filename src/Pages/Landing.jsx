import { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { toast } from "react-hot-toast";

const genAi = new GoogleGenerativeAI("AIzaSyCjtF1Q34gWR5B6_qusY_LqOem5ECHcdks");
const model = genAi.getGenerativeModel({ model: "gemini-1.5-pro" });

const LandingPage = () => {
    const [input, setInput] = useState("");
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [text, setText] = useState("");
    const heroText = "Your Daily Planner";

    useEffect(() => {
        let i = 0;
        setText("");
        const interval = setInterval(() => {
            setText(heroText.slice(0, i + 1));
            i++;
            if (i >= heroText.length) clearInterval(interval);
        }, 100);
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async () => {
        if (!input.trim()) {
            toast.error("Please enter a task or planning need..... ");
            return;
        }

        setLoading(true);
        try {
            // Step 1: Check if the input is related to daily planning
            const classificationPrompt = `You are a smart assistant that only handles daily planning and productivity. 
Respond only with "yes" or "no" to the following question: 
Is this input about daily planning, scheduling, task management, goal setting, or productivity?
Input: "${input}"`;

            const classificationRes = await model.generateContent(
                classificationPrompt
            );
            const classificationText = classificationRes.response
                ?.text()
                ?.trim()
                .toLowerCase();

            if (classificationText !== "yes") {
                setResponse({
                    error:
                        "I can only help with daily planning, scheduling, or productivity. Please ask something related to your tasks or goals.",
                });
                setLoading(false);
                return;
            }

            // Step 2: Generate plan
            const planningPrompt = `You are a productivity assistant. Based on the following user input: "${input}", provide a planning response strictly in JSON format, like this:

{
  "goal_summary": "Brief summary of what the user wants to achieve",
  "suggested_tasks": ["task 1", "task 2", "task 3"],
  "time_blocks": [
    {"time": "9:00 AM - 10:00 AM", "activity": "task 1"},
    {"time": "10:00 AM - 11:00 AM", "activity": "task 2"}
  ],
  "reminders": ["Reminder 1", "Reminder 2"],
  "productivity_tips": ["Tip 1", "Tip 2"]
}`;

            const res = await model.generateContent(planningPrompt);
            const responseText = res.response?.text();
            if (!responseText) throw new Error("No response from AI");

            const jsonMatch = responseText.match(/```json\n(.*)\n```/s);
            if (!jsonMatch) throw new Error("AI did not return proper JSON format");

            const jsonResponse = JSON.parse(jsonMatch[1]);
            setResponse(jsonResponse);
            toast.success("Here's your plan!");
        } catch (error) {
            console.error("AI Error:", error.message);
            setResponse({ error: error.message });
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col items-center justify-center h-full min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4">
            <h1 className="text-7xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 animate-pulse">
                {text}
            </h1>
            <div className="relative mt-10 w-full max-w-lg">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="w-full p-4 text-lg border border-gray-600 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="What do you want to plan today?"
                />
                <button
                    onClick={handleSubmit}
                    className="absolute right-2 top-2 bottom-2 bg-green-600 text-white px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? "Planning..." : "Submit"}
                </button>
            </div>
            {loading && (
                <div className="mt-4 text-green-400 animate-pulse">
                    Creating your plan...
                </div>
            )}
            {response && (
                <div className="mt-6 p-4 bg-gray-800 rounded-lg shadow-lg w-full max-w-lg">
                    {response.error ? (
                        <p className="text-red-400">{response.error}</p>
                    ) : (
                        <>
                            <h2 className="text-xl font-semibold text-green-400">
                                Your Plan:
                            </h2>
                            <p className="mt-2 text-gray-300">
                                <strong>Goal:</strong> {response.goal_summary}
                            </p>
                            <p className="mt-2 text-gray-400">
                                <strong>Tasks:</strong> {response.suggested_tasks.join(", ")}
                            </p>
                            <p className="mt-2 text-gray-400">
                                <strong>Schedule:</strong>{" "}
                                {response.time_blocks.map((block, i) => (
                                    <div key={i}>
                                        {block.time}: {block.activity}
                                    </div>
                                ))}
                            </p>
                            <p className="mt-2 text-gray-400">
                                <strong>Reminders:</strong> {response.reminders.join(", ")}
                            </p>
                            <p className="mt-2 text-gray-400">
                                <strong>Tips:</strong> {response.productivity_tips.join(", ")}
                            </p>
                        </>
                    )}
                </div>
            )}
            {/* Footer for credits */}
            <footer className="mt-10 text-sm text-gray-500 text-center">
                Created by Shraddha Yadav (12310925) & Paul (12301317)
            </footer>
        </div>
    );
};

export default LandingPage;
