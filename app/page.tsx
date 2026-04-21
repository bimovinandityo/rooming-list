import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[#f8f8f9]">
      <div className="bg-[#eff779] h-10 w-10 rounded-lg flex items-center justify-center">
        <span className="text-sm font-bold text-[#101f34]">RL</span>
      </div>
      <h1 className="text-2xl font-bold text-[#101f34]">Rooming List</h1>
      <div className="flex gap-4">
        <Link
          href="/admin-v2"
          className="px-5 py-2.5 bg-[#101f34] text-white text-sm font-medium rounded-md hover:bg-[#1c2d45] transition-colors"
        >
          Admin view
        </Link>
        <Link
          href="/participant"
          className="px-5 py-2.5 border border-[#101f34] text-[#101f34] text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
        >
          Participant view
        </Link>
      </div>
    </main>
  );
}
