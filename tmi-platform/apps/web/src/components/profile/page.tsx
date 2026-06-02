import ProfileLobbyRuntime from "@/components/profile/ProfileLobbyRuntime";

export default function TestProfile() {
  return (
    <ProfileLobbyRuntime 
      role="performer" 
      displayName="TEST PERFORMER" 
      bio="Integration verification in progress. This hub replaces legacy fragmented profiles with a single 3D-ready runtime." 
      stats={{ followers: 1250, xp: 4200 }}
      isLive={true} 
    />
  );
}