//home/page.tsx
import { useUserContext } from '@/components/contexts/UserContext';

import LandingPage from "@/pages/landing-page";

export default function HomePage() {

    const userType = "participant";
    const userName = "Test";

    return <LandingPage /*userType={userType} userName={userName} isLoggedIn={true}*//>;
}
