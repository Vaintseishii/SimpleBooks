import Link from "next/link";

export default function About() {
    return (
        <div className="min-h-screen w-full bg-[#eef0f2] flex flex-col items-center">
            <h1 className="text-4xl">About me page</h1>
            <Link href="/">
            <button className="bg-blue-700 text-white hover:bg-amber-400 hover:text-black rounded">Go back home</button>
            </Link>
        </div>
    )
}