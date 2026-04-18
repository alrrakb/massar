import { useState } from 'react';
import { Users } from 'lucide-react';

interface GroupEnrollmentProps {
    onEnroll: (filters: { level?: string; major?: string }) => Promise<number>;
}

const LEVELS = ['1', '2', '3', '4', '5', '6'];
const MAJORS = [
    'Computer Science',
    'Information Technology',
    'Software Engineering',
    'Data Science',
    'Cybersecurity',
    'Business Administration',
    'Accounting',
    'Medicine',
    'Pharmacy',
    'Law',
];

export function GroupEnrollment({ onEnroll }: GroupEnrollmentProps) {
    const [level, setLevel] = useState('');
    const [major, setMajor] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lastResult, setLastResult] = useState<number | null>(null);

    const handleEnroll = async () => {
        if (!level && !major) return;
        setIsSubmitting(true);
        setLastResult(null);
        try {
            const count = await onEnroll({ level: level || undefined, major: major || undefined });
            setLastResult(count);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isValid = level !== '' || major !== '';

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Academic Level</label>
                    <select
                        value={level}
                        onChange={(e) => { setLevel(e.target.value); setLastResult(null); }}
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer text-sm"
                    >
                        <option value="">All Levels</option>
                        {LEVELS.map((l) => (
                            <option key={l} value={l}>Level {l}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Major / Specialty</label>
                    <select
                        value={major}
                        onChange={(e) => { setMajor(e.target.value); setLastResult(null); }}
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer text-sm"
                    >
                        <option value="">All Majors</option>
                        {MAJORS.map((m) => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                </div>
            </div>

            <button
                onClick={handleEnroll}
                disabled={!isValid || isSubmitting}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all w-full justify-center"
            >
                <Users className="w-4 h-4" />
                {isSubmitting ? 'Enrolling...' : 'Enroll Group'}
            </button>

            {lastResult !== null && (
                <p className={`text-sm text-center font-medium ${lastResult > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {lastResult > 0
                        ? `✓ ${lastResult} student${lastResult !== 1 ? 's' : ''} enrolled successfully`
                        : 'No new students found matching those filters'}
                </p>
            )}
        </div>
    );
}
