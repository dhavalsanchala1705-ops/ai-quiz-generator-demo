import React, { useState } from 'react';
import { ArrowLeft, Plus, Copy, Check, Settings, Play, Wand2, Loader2, Trophy, Medal, Home, Clock, History } from 'lucide-react';
import { User, Difficulty } from '../types';
import { createRoom, updateRoomQuiz, getRoom, endRoomSession, getTeacherRooms } from '../services/storageService';
import { generateQuizQuestions } from '../services/geminiService';

interface TeacherRoomProps {
    user: User;
    onBack: () => void;
}

const TeacherRoom: React.FC<TeacherRoomProps> = ({ user, onBack }) => {
    const [roomCode, setRoomCode] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // Quiz Configuration States
    const [subject, setSubject] = useState('');
    const [topic, setTopic] = useState('');
    const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.EASY);
    const [questionCount, setQuestionCount] = useState(10);
    const [hours, setHours] = useState<string | number>('');
    const [minutes, setMinutes] = useState<string | number>('');
    const [seconds, setSeconds] = useState<string | number>(30);
    const [isGenerating, setIsGenerating] = useState(false);
    const [quizReady, setQuizReady] = useState(false);
    const [participants, setParticipants] = useState<any[]>([]);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [viewHistory, setViewHistory] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [historyRooms, setHistoryRooms] = useState<any[]>([]);

    React.useEffect(() => {
        if (viewHistory) {
            getTeacherRooms(user.id).then(rooms => {
                setHistoryRooms(rooms.filter(r => r.status === 'completed'));
            });
        }
    }, [viewHistory, user.id]);

    React.useEffect(() => {
        if (!roomCode) return;

        const interval = setInterval(async () => {
            const room = await getRoom(roomCode);
            if (room) {
                const progressData = room.participants.map((userId: string) => {
                    const prog = room.studentProgress?.[userId];
                    return {
                        id: userId,
                        name: `Student ${userId.substr(-4)}`,
                        completed: prog?.completed || false,
                        score: prog?.score || 0,
                        currentQuestionIndex: prog?.currentQuestionIndex ?? -1
                    };
                });
                setParticipants(progressData);
            }
        }, 2000);
        return () => clearInterval(interval);
    }, [roomCode]);

    const handleGenerateQuiz = async () => {
        if (!roomCode || !subject || !topic) return;

        setIsGenerating(true);
        try {
            // Calculate total duration
            const h = typeof hours === 'string' ? 0 : hours;
            const m = typeof minutes === 'string' ? 0 : minutes;
            const s = typeof seconds === 'string' ? 0 : seconds;
            const totalSeconds = (h * 3600) + (m * 60) + s;

            // 1. Generate Questions
            const questions = await generateQuizQuestions(subject, topic, difficulty, questionCount, apiKey);

            // 2. Save to Room
            await updateRoomQuiz(roomCode, questions, {
                subject,
                topic,
                difficulty,
                questionCount,
                durationSeconds: totalSeconds
            });

            setQuizReady(true);
        } catch (error) {
            console.error(error);
            alert("Failed to generate quiz. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const generateRoomCode = async () => {
        const newRoom = await createRoom(user.id);
        setRoomCode(newRoom.id);
        setCopied(false);
    };

    const copyToClipboard = () => {
        if (roomCode) {
            navigator.clipboard.writeText(roomCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const subjects = ['Aptitude Test', 'Computer Science', 'Geography', 'History', 'Literature', 'Mathematics', 'Science'];
    const difficulties = [
        { value: Difficulty.EASY, label: 'Easy', color: 'text-green-600' },
        { value: Difficulty.MEDIUM, label: 'Medium', color: 'text-orange-600' },
        { value: Difficulty.HARD, label: 'Hard', color: 'text-red-600' },
    ];

    if (viewHistory) {
        return (
            <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden animate-in fade-in duration-500">
                <div className="p-8 bg-slate-900 text-white relative overflow-hidden">
                    <div className="relative z-10 flex items-center justify-between">
                        <button
                            onClick={() => setViewHistory(false)}
                            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
                        >
                            <ArrowLeft size={20} />
                            Back to Room
                        </button>
                    </div>
                    <div className="mt-6">
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <History size={32} className="text-indigo-400" />
                            Past Sessions
                        </h1>
                        <p className="text-slate-400 mt-2">Review results from your completed quizzes.</p>
                    </div>
                </div>

                <div className="p-8 bg-slate-50 dark:bg-slate-900 min-h-[400px]">
                    {historyRooms.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            <Clock size={48} className="mx-auto mb-4 opacity-50" />
                            <p>No completed sessions found.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {historyRooms.map(room => (
                                <div key={room.id} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wider">
                                                    {room.config?.subject || 'Unknown Subject'}
                                                </span>
                                                <span className="text-slate-400 text-xs">
                                                    {new Date(room.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                                                {room.config?.topic || 'Untitled Quiz'}
                                            </h3>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-indigo-600">
                                                {room.participants.length}
                                            </div>
                                            <div className="text-xs text-slate-500">Students</div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            const histParticipants = room.participants.map(uid => ({
                                                id: uid,
                                                name: `Student ${uid.substr(-4)}`,
                                                score: room.studentProgress?.[uid]?.score || 0,
                                                ...room.studentProgress?.[uid]
                                            }));
                                            setParticipants(histParticipants);
                                            setRoomCode(null);
                                            setViewHistory(false);
                                            setShowLeaderboard(true);
                                        }}
                                        className="w-full py-2 border border-indigo-200 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Trophy size={16} />
                                        View Leaderboard
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (showLeaderboard) {
        const sorted = [...participants].sort((a, b) => b.score - a.score);
        return (
            <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-500">
                <div className="p-8 bg-indigo-900 text-white text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="relative z-10">
                        <Trophy className="mx-auto text-yellow-400 mb-4 drop-shadow-lg" size={64} />
                        <h1 className="text-4xl font-black mb-2 tracking-tight">Final Leaderboard</h1>
                        <p className="text-indigo-200">The session has ended. Here are the top performers!</p>
                    </div>
                </div>

                <div className="p-8 bg-slate-50 dark:bg-slate-900">
                    <div className="space-y-4">
                        {sorted.map((p, index) => (
                            <div key={p.id} className={`flex items-center p-4 rounded-xl border transition-all hover:scale-[1.01] ${index === 0 ? 'bg-yellow-50 border-yellow-200 shadow-lg scale-[1.02]' : index === 1 ? 'bg-slate-100 border-slate-300' : index === 2 ? 'bg-orange-50 border-orange-200' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl mr-4 ${index === 0 ? 'bg-yellow-400 text-yellow-900' : index === 1 ? 'bg-slate-300 text-slate-800' : index === 2 ? 'bg-orange-300 text-orange-900' : 'bg-slate-100 text-slate-500'}`}>
                                    {index + 1}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                        {p.name}
                                        {index === 0 && <Medal size={20} className="text-yellow-500" />}
                                    </h3>
                                    <p className="text-slate-500 text-sm">{index === 0 ? 'Champion' : index < 3 ? 'Top Performer' : 'Participant'}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{Math.round(p.score)} pts</div>
                                    <div className="text-slate-400 text-xs font-medium">Final Score</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={onBack}
                        className="w-full mt-8 py-4 bg-slate-900 dark:bg-slate-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
                    >
                        <Home size={20} />
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700 animate-in fade-in duration-500">
            <div className="p-8 bg-indigo-600 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl"></div>

                <div className="relative z-10 flex items-center justify-between">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-indigo-100 hover:text-white transition-colors font-medium"
                    >
                        <ArrowLeft size={20} />
                        Back
                    </button>

                    {roomCode ? (
                        <div className="bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-sm font-mono tracking-wider border border-white/10">
                            Room: {roomCode}
                        </div>
                    ) : (
                        <button
                            onClick={() => setViewHistory(true)}
                            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 backdrop-blur-sm"
                        >
                            <History size={18} />
                            Past Sessions
                        </button>
                    )}
                </div>

                <h1 className="relative z-10 text-3xl font-bold mt-6 mb-2">Teacher Room</h1>
                <p className="relative z-10 text-indigo-100">Create and manage your live class session.</p>
            </div>

            <div className="p-8">
                {!roomCode ? (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto mb-6">
                            <Plus size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Create New Class Room</h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
                            Generate a unique code to start a new live quiz session for your students.
                        </p>
                        <button
                            onClick={generateRoomCode}
                            className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95"
                        >
                            Generate Room Code
                        </button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-12">
                        {/* Left Column: Room Code Display */}
                        <div className="text-center md:text-left space-y-6">
                            <div>
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Class Entry Code</h3>
                                <div className="relative inline-block w-full">
                                    <div
                                        className="text-5xl font-black text-slate-900 dark:text-white tracking-widest font-mono bg-slate-50 dark:bg-slate-900 px-6 py-8 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-center select-all cursor-pointer hover:border-indigo-500 transition-colors group"
                                        onClick={copyToClipboard}
                                    >
                                        {roomCode}
                                        <div className="absolute top-1/2 right-4 -translate-y-1/2 p-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                            {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} className="text-slate-400" />}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
                                    Share this 6-digit code with your students. They can join from their dashboard.
                                </p>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 h-[300px] overflow-y-auto">
                                <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center justify-between">
                                    <span>Live Student Progress</span>
                                    <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full">{participants.length} Active</span>
                                </h4>

                                {participants.length === 0 ? (
                                    <div className="text-center py-8 text-slate-500">
                                        <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse mx-auto mb-3"></div>
                                        <p>Waiting for students to join...</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {participants.map((p) => (
                                            <div key={p.id} className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs">
                                                        {p.name.substr(-1)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800 dark:text-white">{p.name}</p>
                                                        <p className="text-xs text-slate-500">
                                                            {p.completed
                                                                ? 'Quiz Completed'
                                                                : (p.currentQuestionIndex > -1
                                                                    ? `On Question ${p.currentQuestionIndex + 1}`
                                                                    : 'Ready to Start')}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    {p.completed ? (
                                                        <span className="text-green-600 font-bold text-sm">
                                                            Score: {Math.round(p.score)}/{questionCount}
                                                        </span>
                                                    ) : (
                                                        <div className="flex items-center gap-1 text-slate-400 text-xs">
                                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                            Live
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Quiz Configuration */}
                        <div className="space-y-6 animate-in slide-in-from-right duration-500">
                            <div className="flex items-center gap-2 mb-2">
                                <Settings className="text-indigo-600" size={24} />
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Quiz Configuration</h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Subject</label>
                                    <select
                                        className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                    >
                                        <option value="">Select a subject...</option>
                                        {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Topic</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Algebra, World War II"
                                        className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Difficulty</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {difficulties.map((d) => (
                                            <button
                                                key={d.value}
                                                onClick={() => setDifficulty(d.value)}
                                                className={`p-2 rounded-lg border text-sm font-medium transition-all ${difficulty === d.value
                                                    ? `border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 ${d.color}`
                                                    : 'border-slate-200 dark:border-slate-700 text-slate-500'
                                                    }`}
                                            >
                                                {d.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Questions</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="50"
                                            className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                            value={questionCount}
                                            onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                                        />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Total Quiz Duration
                                        <span className="text-xs font-normal text-slate-500 ml-2">(Total time for {questionCount} questions)</span>
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div>
                                            <input
                                                type="number"
                                                min="0"
                                                max="12"
                                                className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-center"
                                                placeholder="HH"
                                                value={hours}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === '') setHours('');
                                                    else setHours(Math.min(Math.max(parseInt(val), 0), 12));
                                                }}
                                            />
                                            <span className="text-xs text-slate-400 text-center block mt-1">Hours</span>
                                        </div>
                                        <div>
                                            <input
                                                type="number"
                                                min="0"
                                                max="60"
                                                className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-center"
                                                placeholder="MM"
                                                value={minutes}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === '') setMinutes('');
                                                    else setMinutes(Math.min(Math.max(parseInt(val), 0), 60));
                                                }}
                                            />
                                            <span className="text-xs text-slate-400 text-center block mt-1">Mins</span>
                                        </div>
                                        <div>
                                            <input
                                                type="number"
                                                min="0"
                                                max="60"
                                                className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-center"
                                                placeholder="SS"
                                                value={seconds}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === '') setSeconds('');
                                                    else setSeconds(Math.min(Math.max(parseInt(val), 0), 60));
                                                }}
                                            />
                                            <span className="text-xs text-slate-400 text-center block mt-1">Secs</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                                        Gemini API Key (Optional) <span className="font-normal opacity-70">- Leave empty to use system key</span>
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="AIzaSy... (Paste your own key to override)"
                                        className="w-full p-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="mt-8">
                                {quizReady ? (
                                    <div className="space-y-4">
                                        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-3 text-green-700 dark:text-green-300 animate-in fade-in slide-in-from-bottom-4">
                                            <div className="bg-green-100 dark:bg-green-800 p-2 rounded-full">
                                                <Check size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold">Quiz Generated Successfully!</h4>
                                                <p className="text-sm opacity-90">The quiz is live. Students can access it now.</p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => {
                                                if (window.confirm('Are you sure you want to end this session? All students will be disconnected.')) {
                                                    if (roomCode) endRoomSession(roomCode);
                                                    setShowLeaderboard(true);
                                                }
                                            }}
                                            className="w-full py-3 bg-red-50 text-red-600 border-2 border-red-100 hover:bg-red-100 hover:border-red-200 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                                        >
                                            End Live Session
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleGenerateQuiz}
                                        disabled={!subject || !topic || isGenerating}
                                        className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-100 dark:shadow-none transition-all flex items-center justify-center gap-2"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <Loader2 size={24} className="animate-spin" />
                                                Generating with AI...
                                            </>
                                        ) : (
                                            <>
                                                <Wand2 size={24} />
                                                Generate Quiz & Push to Room
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherRoom;
