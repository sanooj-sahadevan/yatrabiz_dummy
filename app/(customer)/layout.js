import Header from "@/components/user/header";
import Footer from "@/components/user/footer";
import ToastNotifications from "@/components/common/toastNotifications/toastNotifications";

export default function CustomerLayout({ children }) {
  return (
    <>
      <Header />
      <ToastNotifications />
      {children}
      <Footer />
    </>
  );
}
