import "../css/euclid-circular-a-font.css";
import "../css/style.css";
import ClientShell from "./ClientShell";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
