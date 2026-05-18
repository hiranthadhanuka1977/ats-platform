type Props = {
  fileName: string;
  onConfirm: () => void;
  onDecline: () => void;
};

export function CvAutofillPromptDialog({ fileName, onConfirm, onDecline }: Props) {
  return (
    <div className="myapps-cv-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="cv-autofill-title">
      <div className="myapps-cv-modal myapps-cv-autofill-modal">
        <div className="myapps-cv-modal-head">
          <h3 id="cv-autofill-title" className="bo-card-title" style={{ marginBottom: 0 }}>
            Complete your profile from this CV?
          </h3>
        </div>
        <div className="myapps-cv-modal-body">
          <p className="bo-page-sub" style={{ marginTop: 0 }}>
            <strong>{fileName}</strong> was uploaded successfully. We can read your CV and pre-fill your profile
            (name, contact details, education, and work history) using our AI parser when configured, or smart
            text extraction otherwise.
          </p>
          <p className="bo-page-sub">You will review everything on your profile page before saving.</p>
          <div className="myapps-cv-actions">
            <button type="button" className="btn btn-secondary" onClick={onDecline}>
              Not now
            </button>
            <button type="button" className="btn btn-primary" onClick={onConfirm}>
              Yes, fill my profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
