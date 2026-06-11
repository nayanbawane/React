import { PModal } from "phoenix-common-react";

interface PreviewModalProps {
  open: boolean;
  onClose: () => void;
  encryptedPreviewURL : string
}

const PreviewModal: React.FC<PreviewModalProps> = ({ open, onClose ,encryptedPreviewURL}) => {
  return (
    <PModal
      open={open}
      title="Preview"
      onClose={onClose}
      isCloseIcon
    >
      <style>
        {`
          .phx-PModal-module-container {
            width: 80vw !important;
            height: 95vh !important;
            max-width: none !important;
          }
          .phx-PModal-module-content {
            height: calc(100% - 60px) !important;
            overflow: auto !important;
          }
          .preview_modal {
            width: 100% !important;
            height: 100% !important;
          }
        `}
      </style>
          <div className="preview_modal" style={{ height: '80vh' }}>
              <iframe
                  src={encryptedPreviewURL}
                  width="100%"
                  height="100%"
                  style={{ border: 'none', padding: '20px' }}
              />
          </div>

    </PModal>
  );
};

export default PreviewModal;

