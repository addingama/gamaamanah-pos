"use client";

type Props = {
  label?: string;
  className?: string;
};

export function ConfirmDeleteButton({ label = "Hapus", className }: Props) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!window.confirm("Yakin ingin menghapus? Tindakan ini tidak bisa dibatalkan.")) {
          e.preventDefault();
        }
      }}
    >
      {label}
    </button>
  );
}
