import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

type ImageCarouselProps = {
  images: string[];
  label: string;
  className: string;
  imageClassName?: string;
  autoPlayMs?: number;
};

export function ImageCarousel({
  images,
  label,
  className,
  imageClassName = "object-cover",
  autoPlayMs = 5000,
}: ImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const imageCount = images.length;

  useEffect(() => {
    if (imageCount < 2 || autoPlayMs <= 0) return;

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % imageCount);
    }, autoPlayMs);

    return () => window.clearInterval(intervalId);
  }, [autoPlayMs, imageCount]);

  useEffect(() => {
    setActiveIndex((current) => Math.min(current, Math.max(0, imageCount - 1)));
  }, [imageCount]);

  if (!imageCount) return null;

  const move = (direction: -1 | 1) => {
    setActiveIndex((current) => (current + direction + imageCount) % imageCount);
  };

  const renderImages = (large = false) => (
    <div
      className="flex h-full transition-transform duration-500 ease-in-out"
      style={{ transform: `translateX(-${activeIndex * 100}%)` }}
    >
      {images.map((image, index) => (
        <button
          key={`${label}-${index}`}
          type="button"
          onClick={() => setExpanded(true)}
          aria-label={`View larger ${label} photo ${index + 1}`}
          className="h-full w-full flex-none cursor-zoom-in"
        >
          <img
            src={image}
            alt={`${label}, photo ${index + 1}`}
            className={`h-full w-full ${imageClassName} ${large ? "rounded-xl" : ""}`}
          />
        </button>
      ))}
    </div>
  );

  const renderControls = (expandedView = false) =>
    imageCount > 1 ? (
      <>
        <button
          type="button"
          aria-label={`Previous ${label} photo`}
          onClick={() => move(-1)}
          className={`absolute left-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full shadow transition-colors ${
            expandedView ? "bg-black/65 text-white hover:bg-black/85" : "bg-background/85 text-foreground hover:bg-background"
          }`}
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          type="button"
          aria-label={`Next ${label} photo`}
          onClick={() => move(1)}
          className={`absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full shadow transition-colors ${
            expandedView ? "bg-black/65 text-white hover:bg-black/85" : "bg-background/85 text-foreground hover:bg-background"
          }`}
        >
          <ChevronRight className="size-5" />
        </button>
        {!expandedView ? (
          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Go to ${label} photo ${index + 1}`}
                aria-current={activeIndex === index}
                onClick={() => setActiveIndex(index)}
                className={`h-2.5 rounded-full transition-all ${
                  activeIndex === index ? "w-7 bg-white" : "w-2.5 bg-white/60"
                }`}
              />
            ))}
          </div>
        ) : (
          <p aria-live="polite" className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/65 px-3 py-1 text-sm text-white">
            {activeIndex + 1} / {imageCount}
          </p>
        )}
      </>
    ) : null;

  return (
    <>
      <div
        className={`relative overflow-hidden ${className}`}
        role="region"
        aria-roledescription="carousel"
        aria-label={`${label} photos`}
      >
        {renderImages()}
        {renderControls()}
      </div>
      <Dialog open={expanded} onOpenChange={setExpanded}>
        <DialogContent
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") move(-1);
            if (event.key === "ArrowRight") move(1);
          }}
          className="w-[calc(100vw-1.5rem)] max-w-6xl border-0 bg-black/95 p-3 text-white shadow-2xl sm:rounded-2xl md:p-5"
        >
          <DialogTitle className="sr-only">{label} photo {activeIndex + 1}</DialogTitle>
          <div className="relative h-[75vh] max-h-[82vh] overflow-hidden">
            {renderImages(true)}
            {renderControls(true)}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
