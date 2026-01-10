import React, { useState } from 'react';
import { ArrowLeft, LogIn, Loader2 } from 'lucide-react';
import { User } from '../types';
import { joinRoom, getRoom } from '../services/storageService';

interface StudentJoinProps {
    user: User;
    onBack: () => void;
    onQuizStart: (room: any) => void;
}

const StudentJoin: React.FC<StudentJoinProps> = ({ user, onBack, onQuizStart }) => {
    const [roomCode, setRoomCode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [joined, setJoined] = useState(false);

    React.useEffect(() => {
        let interval: any;
        if (joined && roomCode) {
            interval = setInterval(async () => {
                try {
                    const room = await getRoom(roomCode);
                    if (room && room.status === 'ready' && room.questions && room.questions.length > 0) {
                        onQuizStart(room);
                    }
                } catch (e) {
                    // Ignore errors during polling
                }
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [joined, roomCode, onQuizStart]);

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (roomCode.length !== 6) {
            setError('Please enter a valid 6-digit room code.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Simulate network delay (Removed)
            // await new Promise(resolve => setTimeout(resolve, 800));

            await joinRoom(roomCode, user.id);
            setJoined(true);
        } catch (err: any) {
            setError(err.message || 'Failed to join room. Please check the code.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700 animate-in fade-in duration-500 mt-10">
            <div className="p-8 bg-indigo-600 text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-500 opacity-20 rounded-full translate-x-1/3 translate-y-1/3 blur-2xl"></div>

                <button
                    onClick={onBack}
                    className="relative z-10 flex items-center gap-2 text-indigo-100 hover:text-white transition-colors mb-6 font-medium"
                >
                    <ArrowLeft size={20} />
                    Back
                </button>

                <h1 className="relative z-10 text-2xl font-bold mb-2">Join a Class</h1>
                <p className="relative z-10 text-indigo-100 text-sm">Enter the code shared by your teacher.</p>
            </div>

            <div className="p-8">
                {joined ? (
                    <div className="text-center py-8 animate-in zoom-in">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                            <LogIn size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Successfully Joined!</h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">
                            You are now in the class room <strong>{roomCode}</strong>.
                            <br />
                            Please wait for your teacher to start the session.
                        </p>
                        <button
                            onClick={onBack}
                            className="w-full py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleJoin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Room Code
                            </label>
                            <input
                                type="text"
                                value={roomCode}
                                onChange={(e) => setRoomCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="w-full p-4 text-center text-3xl tracking-[0.5em] font-mono font-bold border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 focus:border-indigo-500 outline-none bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white transition-all placeholder:tracking-normal placeholder:font-sans placeholder:text-lg placeholder:text-slate-400"
                                placeholder="000000"
                                disabled={isLoading}
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg text-center font-medium animate-shake">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={roomCode.length !== 6 || isLoading}
                            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center transition-all ${roomCode.length !== 6 || isLoading
                                ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30 transform hover:-translate-y-0.5'
                                }`}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin mr-2" size={24} />
                                    Joining...
                                </>
                            ) : (
                                <>
                                    Join Room <LogIn className="ml-2" size={20} />
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default StudentJoin;
