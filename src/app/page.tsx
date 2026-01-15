'use client';

import { AppProvider, useApp } from './context';
import { Sidebar } from './Sidebar';
import { Dashboard } from './Dashboard';
import { TaskManager } from './TaskManager';
import { EvalSuites } from './EvalSuites';
import { EvalRunner } from './EvalRunner';
import { TranscriptViewer } from './TranscriptViewer';
import { Analytics } from './Analytics';

function MainContent() {
    const { currentPage } = useApp();

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return <Dashboard />;
            case 'tasks':
                return <TaskManager />;
            case 'suites':
                return <EvalSuites />;
            case 'runner':
                return <EvalRunner />;
            case 'transcripts':
                return <TranscriptViewer />;
            case 'analytics':
                return <Analytics />;
            default:
                return <Dashboard />;
        }
    };

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                {renderPage()}
            </main>
        </div>
    );
}

export default function Home() {
    return (
        <AppProvider>
            <MainContent />
        </AppProvider>
    );
}
