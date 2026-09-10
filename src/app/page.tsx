import Link from "next/link";


export default function Overview() {
  return (
    <div className="min-h-screen w-full bg-[#eef0f2] flex">
      <div className="h-100 w-100 border-10 flex flex-col items-center">
        <Link className="bg-blue-600 text-2xl w-50" href={"/clients"}>click me</Link>

      </div>
    </div>
  )
}