"use client";

interface Props {
  title: string;
  message: string;
  confirmText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  title,
  message,
  confirmText = "Confirm",
  onConfirm,
  onCancel,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onCancel}
      />

      <div className="relative z-10 w-full max-w-md rounded bg-white p-6">
        <h2 className="mb-2 text-lg font-semibold">
          {title}
        </h2>
        <p className="mb-4 text-slate-600">
          {message}
        </p>

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded border px-4 py-2"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded bg-slate-900 px-4 py-2 text-white"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
