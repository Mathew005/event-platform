import LandingPage from "@/pages/landing-page";

export default function HomePage() {
    const userType = "organizer"; //participant, organizer 
    const userName = "";

    return <LandingPage userType={userType} userName={userName} isLoggedIn={false}/>;
}
