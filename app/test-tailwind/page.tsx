"use client";

export default function TestPage() {
  return (
    <div className="p-8">
      <div className="bg-red-500 text-white p-4 mb-4 rounded">
        ✅ If you see RED box, Tailwind is WORKING
      </div>
      <div className="bg-blue-500 text-white p-4 mb-4 rounded">
        ✅ If you see BLUE box, Tailwind is WORKING
      </div>
      <div className="bg-green-500 text-white p-4 rounded">
        ✅ If you see GREEN box, Tailwind is WORKING
      </div>
      <p className="mt-4 text-gray-700">If you see NO colors, Tailwind is broken.</p>
    </div>
  );
}
