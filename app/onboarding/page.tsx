import { Container } from "@/components/atoms/container";
import { ProfileForm } from "@/components/organisms/profile-form";

export default function OnboardingPage() {
  return (
    <Container>
      <ProfileForm
        mode="onboarding"
        initialFirstName=""
        initialLastName=""
        initialEmail=""
        redirectTo="/"
      />
    </Container>
  );
}
