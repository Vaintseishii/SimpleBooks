import Link from "next/link";
import About from "./about/page";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-[#eef0f2] flex flex-col items-center">
      <h1 className="font-bold text-[#153243] text-4xl mt-4">SimpleBooks</h1>
      <img src="https://preview.redd.it/jack-black-finding-some-gold-v0-mvk1ifapzijg1.jpeg?width=1080&crop=smart&auto=webp&s=c99f0b615230c377a21e860aca4b9981342653ab" className="w-400 h-250"/>
      <Link href={"about/"}><button className="bg-blue-700 text-white hover:bg-amber-400 hover:text-black rounded">Go to about</button></Link>
    </div>
  )
}