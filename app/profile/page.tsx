import { redirect } from "next/navigation";
import { Container } from "@/components/atoms/container";
import { ProfileForm } from "@/components/organisms/profile-form";
import { getCurrentUserProfileState } from "@/lib/profile-gate";

export default async function ProfilePage() {
  const { userId, profile } = await getCurrentUserProfileState();
  if (userId == null) {
    redirect("/");
  }
  if (profile == null) {
    redirect("/onboarding");
  }

  return (
    <Container>
      <ProfileForm
        mode="edit"
        initialFirstName={profile.first_name}
        initialLastName={profile.last_name}
        initialEmail={profile.email}
        redirectTo="/profile"
      />
    </Container>
  );
}
