import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "Back office preferences and configuration.",
};

export default function SettingsPage() {
  return (
    <main id="main-content" className="bo-content">
      <h1 className="bo-page-title">Settings</h1>
      <p className="bo-page-sub">Workspace preferences and configuration will appear here.</p>
    </main>
  );
}
