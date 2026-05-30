"use client";

import { useState, useEffect } from "react";
import { ImageIcon, ExternalLink, AlertCircle } from "lucide-react";

interface CloudinaryImage {
  public_id: string;
  url: string;
  width: number;
  height: number;
  format: string;
  created_at: string;
}

interface ApiResponse {
  images?: CloudinaryImage[];
  error?: string;
}

export default function CloudinaryGallery() {
  const [images, setImages] = useState<CloudinaryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchImages() {
      try {
        const res = await fetch("/api/cloudinary");

        if (!res.ok) {
          let msg: string;
          try {
            const body = await res.json();
            msg = body.error || `API error ${res.status}`;
          } catch {
            msg = res.status === 404
              ? "API route not found — check for conflicting route files"
              : `API returned ${res.status}`;
          }
          if (!cancelled) setError(msg);
          return;
        }

        const data: ApiResponse = await res.json();

        if (cancelled) return;

        if (data.error) {
          setError(data.error);
          return;
        }

        setImages(data.images || []);
      } catch {
        if (!cancelled) {
          setError("Unable to reach Cloudinary — is the dev server running?");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchImages();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="px-2 py-3 border-t border-zinc-100 dark:border-zinc-800 hidden md:block">
        <div className="flex items-center gap-2 px-1 mb-2">
          <div className="h-3 w-3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-3 w-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
        </div>
        <div className="grid grid-cols-3 gap-1 px-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-700"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-2 py-3 border-t border-zinc-100 dark:border-zinc-800 hidden md:block">
        <div className="flex items-center gap-2 px-1 text-xs text-zinc-400">
          <AlertCircle size={13} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="px-2 py-3 border-t border-zinc-100 dark:border-zinc-800 hidden md:block">
        <div className="flex items-center gap-2 px-1 text-xs text-zinc-400">
          <ImageIcon size={13} />
          <span>No images found</span>
        </div>
      </div>
    );
  }

  return (
    <div className="px-2 py-3 border-t border-zinc-100 dark:border-zinc-800 hidden md:block">
      <div className="flex items-center gap-2 px-1 mb-2 text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
        <ImageIcon size={12} />
        <span>📷 Recent Images</span>
      </div>
      <div className="grid grid-cols-3 gap-1.5 px-1">
        {images.map((img) => (
          <a
            key={img.public_id}
            href={img.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-cyan-400 dark:hover:ring-cyan-500 transition-all"
            title="Open full image"
          >
            <img
              src={img.url.replace("/upload/", "/upload/c_thumb,w_192,h_192/")}
              alt=""
              loading="lazy"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors">
              <ExternalLink
                size={14}
                className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
