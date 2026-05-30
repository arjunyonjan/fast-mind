"use client";

import { useState, useEffect } from "react";
import { ImageIcon, AlertCircle, ExternalLink } from "lucide-react";

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

export default function CloudinaryGalleryPage() {
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
            msg = `API returned ${res.status}`;
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
          setError("Unable to reach Cloudinary");
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
      <div className="bg-zinc-50 dark:bg-zinc-950 p-6 sm:p-10 h-full overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="h-7 w-56 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800 mb-8" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-6 h-full">
        <div className="flex flex-col items-center gap-3 text-zinc-400">
          <AlertCircle size={40} />
          <p className="text-lg font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-6 h-full">
        <div className="flex flex-col items-center gap-3 text-zinc-400">
          <ImageIcon size={40} />
          <p className="text-lg font-medium">No images found</p>
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            Upload images to Cloudinary to see them here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-50 dark:bg-zinc-950 p-6 sm:p-10 h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
            Cloudinary Gallery
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {images.length} image{images.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((img) => (
            <a
              key={img.public_id}
              href={img.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block aspect-square rounded-lg overflow-hidden bg-zinc-200 dark:bg-zinc-700 hover:ring-2 hover:ring-cyan-400 dark:hover:ring-cyan-500 transition-all"
              title="Open full image"
            >
              <img
                src={img.url.replace(
                  "/upload/",
                  "/upload/c_fill,w_200,h_200/"
                )}
                srcSet={`${img.url.replace("/upload/", "/upload/c_fill,w_200,h_200/")} 200w, ${img.url.replace("/upload/", "/upload/c_fill,w_400,h_400/")} 400w`}
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                alt=""
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors">
                <ExternalLink
                  size={18}
                  className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
