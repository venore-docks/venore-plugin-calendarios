"use client";

import { useRef, useTransition } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@venore/plugin-sdk/ui";
import { uploadFileAction } from "../admin/actions";

// Miniatura 16:9 + enviar/trocar/remover. `previewUrl` já é a imagem que vale hoje (própria, padrão do
// setor ou placeholder); `isCustom` diz se é uma imagem enviada (habilita "Remover").
export function CoverField({
  label,
  hint,
  previewUrl,
  isCustom,
  onUploaded,
  onClear,
  disabled,
}: {
  label: string;
  hint: string;
  previewUrl: string;
  isCustom: boolean;
  onUploaded: (mediaId: string, url: string) => void;
  onClear: () => void;
  disabled?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();

  const upload = (file: File) =>
    startTransition(async () => {
      const form = new FormData();
      form.set("file", file);
      const result = await uploadFileAction(form);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      onUploaded(result.data.id, result.data.url);
    });

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={previewUrl} alt="" className="aspect-video w-40 rounded-md border bg-muted object-cover" />
        {!disabled && (
          <div className="flex flex-col gap-1">
            <input
              ref={input}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) upload(file);
                event.target.value = "";
              }}
            />
            <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => input.current?.click()}>
              <ImagePlus className="size-4" />
              {isCustom ? "Trocar imagem" : "Enviar imagem"}
            </Button>
            {isCustom && (
              <Button type="button" size="sm" variant="ghost" onClick={onClear}>
                <Trash2 className="size-4" />
                Remover
              </Button>
            )}
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
