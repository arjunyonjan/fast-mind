"use client";
import { useState, useEffect } from "react";

export function DiagramList() {
  const [files, setFiles] = useState<string[]>([]);
  useEffect(() => {
    fetch("/api/diagrams")
      .then((res) => res.json())
      .then(setFiles)
      .catch(console.error);
  }, []);
  if (files.length === 0) return <div>Loading diagrams...</div>;
  return (
    <div className="grid grid-cols-2 gap-4">
      {files.map((file) => (
        <div key={file} className="border rounded p-2">
          <img src={`/api/diagrams/${file}`} alt={file} className="w-full h-auto" />
          <p className="text-sm text-center mt-2">{file}</p>
        </div>
      ))}
    </div>
  );
}