export default function Overview() {
    return (
        <div className="p-4">
            <div className="mt-4 flex h-[calc(100vh-12rem)] min-h-[400px] gap-4">
                {/* Left half: parent div holding the 2 stacked boxes */}
                <div className="flex w-1/2 flex-col gap-4">
                    <div className="flex-1 rounded-3xl bg-white shadow-lg" />
                    <div className="flex-1 rounded-3xl bg-white shadow-lg" />
                </div>

                {/* Right half: 1 big box */}
                <div className="w-1/2 rounded-3xl bg-white shadow-lg" />
            </div>
        </div>
    );
}
