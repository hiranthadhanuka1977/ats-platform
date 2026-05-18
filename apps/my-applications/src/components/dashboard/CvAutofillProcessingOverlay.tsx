type Props = {
  fileName: string;
  label: string;
  progress: number;
};

export function CvAutofillProcessingOverlay({ fileName, label, progress }: Props) {
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <div className="myapps-cv-modal-backdrop myapps-cv-processing-backdrop" role="status" aria-live="polite" aria-busy="true">
      <div className="myapps-cv-modal myapps-cv-autofill-modal myapps-cv-processing-card">
        <div className="myapps-cv-modal-body">
          <h3 className="bo-card-title" style={{ marginTop: 0 }}>
            Processing your CV
          </h3>
          <p className="bo-page-sub" style={{ marginTop: 0 }}>
            Reading <strong>{fileName}</strong> and extracting profile details…
          </p>
          <p className="myapps-cv-processing-label">{label}</p>
          <div
            className="myapps-cv-progress-track"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(clamped)}
          >
            <div className="myapps-cv-progress-fill" style={{ width: `${clamped}%` }} />
          </div>
          <p className="bo-page-sub myapps-cv-processing-percent">{Math.round(clamped)}%</p>
        </div>
      </div>
    </div>
  );
}
