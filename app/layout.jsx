import "./globals.css";
import { AuthProvider } from "../context/AuthContext";

export const metadata = {
  title: "Personal Timeline",
  description: "บันทึกชีวิต เอกสาร และวันสำคัญของคุณในที่เดียว",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body style={{ margin: 0, height: "100vh" }}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
