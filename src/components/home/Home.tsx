import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/sections/Hero";
import FasterReplies from "./sections/FasterReplies";
import MeetAI from "./sections/MeetAI";
import TwoWays from "./sections/TwoWays";
import WhyTeamUses from "./sections/WhyTeamUses";
import ChatbotBuilder from "./sections/ChatbotBuilder";
import Industries from "./sections/Industries";
import Faq from "./sections/Faq";
import FinalCta from "./sections/FinalCta";
import Footer from "../layout/Footer";
import BottomToTop from "../layout/BottomToTop";
import CursorFollower from "../CursorFollower";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <FasterReplies />
        <MeetAI />
        <TwoWays />
        <WhyTeamUses />
        <ChatbotBuilder />    
        <Industries />
        <Faq />          
        <FinalCta />           
      </main>
      <Footer />
      <BottomToTop />
      <CursorFollower />
    </div>
  );
}
