export function LoginHero() {
  return (
    <div className="bo-login-visual" role="region" aria-labelledby="bo-login-visual-heading">
      <div className="bo-login-visual-bg" aria-hidden />
      <div className="bo-login-visual-overlay" aria-hidden />
      <div className="bo-login-visual-inner">
        <div className="bo-login-visual-brand">
          <span className="bo-login-visual-logo" aria-hidden>
            T
          </span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "var(--text-lg)",
            }}
          >
            TalentHub
          </span>
        </div>
        <h1 id="bo-login-visual-heading" className="bo-login-visual-title">
          Manage your journey.
        </h1>
        <p className="bo-login-visual-copy">
          Track applications, update your profile, and stay in control of every step in one place.
        </p>
      </div>
    </div>
  );
}
