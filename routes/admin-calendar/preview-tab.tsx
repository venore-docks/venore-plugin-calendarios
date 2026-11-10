"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import type { CalendarContent } from "../../contracts/types";
import { renderPreviewAction } from "../admin/actions";

// A4 em CSS px — o HTML da prévia é o mesmo que o Chromium imprime no PDF (shared/render).
const PAGE_WIDTH = 794;
const PAGE_HEIGHT = 1123;

export function PreviewTab({ editionId, content }: { editionId: string; content: CalendarContent }) {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const box = useRef<HTMLDivElement>(null);
  // A prévia acompanha a edição, mas só a última resposta vale (as anteriores chegam fora de ordem).
  const requestId = useRef(0);

  useEffect(() => {
    const element = box.current;
    if (!element) return;
    const update = () => setScale(Math.min(1, element.clientWidth / PAGE_WIDTH));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const current = ++requestId.current;
    setLoading(true);
    const timer = setTimeout(async () => {
      const result = await renderPreviewAction(editionId, content);
      if (current !== requestId.current) return;
      setLoading(false);
      if (result.ok) {
        setHtml(result.data.html);
        setError(null);
      } else {
        setError(result.error);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [editionId, content]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {loading && <Loader2 className="size-4 animate-spin" />}
        {error ? <span className="text-destructive">{error}</span> : <span>Prévia do que será impresso — acompanha o que você edita, mesmo sem salvar.</span>}
      </div>
      <div ref={box} className="w-full max-w-3xl">
        <div className="overflow-hidden rounded-md border bg-muted shadow-sm" style={{ height: PAGE_HEIGHT * scale }}>
          {html && (
            <iframe
              title="Prévia do calendário"
              // Sem scripts nem acesso à origem do portal: é só o documento renderizado.
              sandbox=""
              srcDoc={html}
              style={{ width: PAGE_WIDTH, height: PAGE_HEIGHT, border: 0, transform: `scale(${scale})`, transformOrigin: "top left", background: "white" }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
