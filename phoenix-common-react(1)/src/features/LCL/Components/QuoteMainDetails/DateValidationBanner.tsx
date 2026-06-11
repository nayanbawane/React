import React from "react";

interface DateValidationBannerProps {
  visible: boolean;
  onClose: () => void;
}

export const DateValidationBanner: React.FC<DateValidationBannerProps> = ({
  visible,
  onClose,
}) => {
  if (!visible) return null;

  return (
    <div
      style={{
        backgroundColor: "#fff3cd",
        border: "1px solid #ffc107",
        borderRadius: "4px",
        padding: "8px 12px",
        marginBottom: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: "11px",
        color: "#856404",
      }}
    >
      <span>⚠️ Effective Date cannot be after Expiration Date</span>
      <button
        onClick={onClose}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          fontSize: "16px",
          color: "#856404",
          padding: 0,
        }}
      >
        ×
      </button>
    </div>
  );
};
