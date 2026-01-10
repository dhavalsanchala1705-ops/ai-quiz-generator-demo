import React from 'react';
import { ArrowLeft, Shield, Lock, FileText, Database, Share2, Eye, UserCheck } from 'lucide-react';

interface PrivacyPolicyProps {
    onBack: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
    return (
        <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
            <button
                onClick={onBack}
                className="mb-6 flex items-center text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
            >
                <ArrowLeft size={20} className="mr-2" />
                Back to App
            </button>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700">
                <div className="bg-indigo-600 p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-10">
                        <Shield size={200} />
                    </div>
                    <h1 className="text-3xl font-bold mb-2 relative z-10">Privacy Policy</h1>
                    <p className="text-indigo-100 relative z-10">Effective Date: {new Date().toLocaleDateString()}</p>
                </div>

                <div className="p-8 space-y-8 text-slate-700 dark:text-slate-300 leading-relaxed">

                    <section>
                        <p className="mb-4">
                            This Privacy Policy describes how <strong>FundaMinds</strong> ("we", "our", "us"), owned and operated by FundaMinds Co, collects, uses, discloses, and protects your information when you use our educational web application and related services (collectively, the "Platform").
                        </p>
                        <p>
                            By accessing or using FundaMinds, you agree to the collection and use of information in accordance with this Privacy Policy.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 p-2 rounded-lg"><FileText size={20} /></span>
                            1. About FundaMinds
                        </h2>
                        <p>
                            FundaMinds is an educational web application designed to help learners improve their knowledge through quizzes, learning analytics, and AI-powered educational content.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-lg"><Database size={20} /></span>
                            2. Information We Collect
                        </h2>
                        <p className="mb-4">We collect the following types of information to provide and improve our services:</p>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl">
                                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">2.1 Personal Information</h3>
                                <ul className="list-disc pl-5 space-y-1 text-sm">
                                    <li>Full name</li>
                                    <li>Email address</li>
                                    <li>Password (stored in encrypted/hashed form)</li>
                                    <li>Account type (e.g., student, educator)</li>
                                </ul>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl">
                                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">2.2 Educational & Usage Data</h3>
                                <ul className="list-disc pl-5 space-y-1 text-sm">
                                    <li>Quiz attempts and responses</li>
                                    <li>Scores, performance, and progress data</li>
                                    <li>Topics studied and learning preferences</li>
                                    <li>Time spent on quizzes or lessons</li>
                                </ul>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl">
                                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">2.3 Technical Information</h3>
                                <ul className="list-disc pl-5 space-y-1 text-sm">
                                    <li>IP address</li>
                                    <li>Browser type and version</li>
                                    <li>Device information</li>
                                    <li>Operating system</li>
                                </ul>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl">
                                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">2.4 Cookies</h3>
                                <ul className="list-disc pl-5 space-y-1 text-sm">
                                    <li>Maintain secure user sessions</li>
                                    <li>Improve user experience</li>
                                    <li>Analyze platform performance</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-2 rounded-lg"><Eye size={20} /></span>
                            3. How We Use Your Information
                        </h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>To create and manage user accounts</li>
                            <li>To authenticate users and secure the Platform</li>
                            <li>To generate quizzes and educational content</li>
                            <li>To personalize learning experiences</li>
                            <li>To analyze performance and improve our services</li>
                            <li>To communicate important updates and support messages</li>
                            <li>To prevent fraud, abuse, and security threats</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 p-2 rounded-lg"><Share2 size={20} /></span>
                            4. Use of Artificial Intelligence (AI)
                        </h2>
                        <div className="bg-purple-50 dark:bg-purple-900/10 border-l-4 border-purple-500 p-4">
                            <p className="mb-2">FundaMinds uses AI technologies, including third-party AI services, to generate educational content such as quizzes and learning recommendations.</p>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                                <li>AI processing is limited to fulfilling educational features</li>
                                <li>We do not use AI to make automated decisions with legal or significant personal impact</li>
                                <li>User data is not sold or used for advertising purposes</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-2 rounded-lg"><Lock size={20} /></span>
                            5. Data Security
                        </h2>
                        <p className="mb-4">We take data security seriously and implement industry-standard safeguards, including:</p>
                        <ul className="list-disc pl-5 space-y-2 mb-4">
                            <li>HTTPS encryption for all data in transit</li>
                            <li>Secure servers and access controls</li>
                            <li>Encrypted storage of sensitive data like passwords</li>
                        </ul>
                        <p className="text-sm text-slate-500 italic">However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 p-2 rounded-lg"><UserCheck size={20} /></span>
                            6. Your Rights
                        </h2>
                        <p className="mb-2">You have the right to:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Access and review your personal data</li>
                            <li>Update or correct your information</li>
                            <li>Request deletion of your account and data</li>
                            <li>Withdraw consent where applicable</li>
                        </ul>
                    </section>

                    <section className="border-t border-slate-200 dark:border-slate-700 pt-8 mt-8">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Contact Us</h2>
                        <p className="mb-4">If you have any questions, concerns, or requests regarding this Privacy Policy or your data, please contact us:</p>
                        <address className="not-italic">
                            <strong>FundaMinds Co</strong><br />
                            <a href="mailto:support@fundaminds.com" className="text-indigo-600 hover:underline">support@fundaminds.com</a><br />
                            <a href="mailto:sanchaldhaval1993@gmail.com" className="text-indigo-600 hover:underline">sanchaldhaval1993@gmail.com</a><br />
                            <a href="tel:+919316294662" className="text-indigo-600 hover:underline">+91 93162 94662</a>
                        </address>
                    </section>

                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
