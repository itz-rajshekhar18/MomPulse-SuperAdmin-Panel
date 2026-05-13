import Header from "../components/Header";
import LoginForm from "../components/LoginForm";
import MonitoringSection from "../components/MonitoringSection";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <LoginForm />
        <MonitoringSection />
      </main>
      
      <Footer />
    </div>
  );
}
