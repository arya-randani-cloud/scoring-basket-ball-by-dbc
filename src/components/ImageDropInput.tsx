import * as React from "react";
import { Upload, Image as ImageIcon } from "lucide-react";
import { cn } from "../lib/utils";

interface ImageDropInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  accentColor?: "blue" | "amber" | "slate";
  style?: React.CSSProperties;
}

// Helper to compress/downscale base64 images before upload/save to prevent huge payloads which can drop socket.io connections
const compressImage = (base64Str: string, maxWidth = 350, maxHeight = 350): Promise<string> => {
  return new Promise((resolve) => {
    // If it's not a base64 string or is already small, skip compression
    if (!base64Str.startsWith("data:image/") || base64Str.length < 50000) {
      resolve(base64Str);
      return;
    }
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        // Using JPEG format with 0.8 quality handles transparency as solid color or we can use PNG.
        // Let's use PNG with toDataURL - which is lossless but downscaling still saves massive space.
        resolve(canvas.toDataURL("image/png"));
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => {
      resolve(base64Str);
    };
  });
};

export default function ImageDropInput({
  value,
  onChange,
  placeholder = "Enter URL or drag/drop image from computer",
  disabled = false,
  accentColor = "blue",
  style,
}: ImageDropInputProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        compressImage(result).then((compressed) => {
          onChange(compressed);
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        compressImage(result).then((compressed) => {
          onChange(compressed);
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const borderClass = cn(
    "border rounded transition-all duration-200 relative overflow-hidden flex gap-2 p-1.5",
    isDragging
      ? accentColor === "blue"
        ? "border-blue-500 bg-blue-500/10 scale-[1.01]"
        : accentColor === "amber"
        ? "border-amber-500 bg-amber-500/10 scale-[1.01]"
        : "border-slate-400 bg-slate-700/50 scale-[1.01]"
      : "border-bento-border bg-bento-bg"
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="group relative"
      id={`dropzone-${accentColor}`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        disabled={disabled}
      />
      
      <div className={borderClass} style={style}>
        {/* URL Input */}
        <input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="bg-transparent flex-1 text-[10px] font-medium focus:outline-none placeholder-slate-500 px-1.5 py-1 text-white disabled:opacity-50"
          placeholder={placeholder}
          disabled={disabled}
        />

        {/* Dynamic Indicator or Action Buttons */}
        <div className="flex items-center gap-1">
          {value && (
            <div className="h-6 w-6 rounded overflow-hidden bg-white/15 flex items-center justify-center p-0.5 border border-white/10">
              <img src={value} alt="Preview" className="h-full w-full object-contain" />
            </div>
          )}
          <button
            type="button"
            onClick={triggerFileSelect}
            className={cn(
              "px-2 py-1.5 rounded flex items-center justify-center transition-all cursor-pointer font-bold text-[9px] uppercase tracking-wide gap-1 disabled:opacity-50 disabled:pointer-events-none",
              accentColor === "blue"
                ? "bg-blue-600 hover:bg-blue-500 text-white"
                : accentColor === "amber"
                ? "bg-amber-600 hover:bg-amber-500 text-white"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            )}
            title="Upload image / logo from your computer"
            disabled={disabled}
          >
            <Upload className="w-3 h-3" />
            <span>Computer</span>
          </button>
        </div>
      </div>

      {isDragging && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-[1px] rounded pointer-events-none">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white">
            <Upload className="w-4 h-4 animate-bounce" />
            <span>Drop to Upload</span>
          </div>
        </div>
      )}
    </div>
  );
}
