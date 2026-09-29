export default function Overview() {
    return (
        <div className="flex h-screen flex-col p-4">
        {/* Dashboard title - plain div, no rounding, no floating box look */}

            <div className="flex flex-1 gap-4 overflow-hidden">
            {/* Left half: parent div holding the 3 stacked boxes */}
                <div className="flex w-1/2 flex-col gap-4">
                    <div className="flex-1 pb-4">
                        <h1 className="font-bold text-2xl text-white">Dashboard</h1>
                    </div>

                    <div className="flex-1 rounded-2xl bg-primary-foreground p-4 shadow-lg">
                        <span className="font-medium text-white">Needs Attention</span>
                    </div>
                    <div className="flex-1 rounded-2xl bg-primary-foreground p-4 shadow-lg">
                        <span className="font-medium text-white">Invoices</span>
                    </div>
                    <div className="flex-1 rounded-2xl bg-primary-foreground p-4 shadow-lg">
                        <span className="font-medium text-white">Expenses</span>
                    </div>
                </div>

                {/* Right half: 1 big box */}
                <div className="w-1/2 rounded-2xl bg-primary-foreground  p-4 shadow-lg">
                        <span className="font-medium text-white">Reports</span>
                </div>
            </div>
        </div>
    );
}
