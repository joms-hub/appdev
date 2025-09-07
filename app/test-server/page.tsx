import { getOnboardingData } from "@/actions/preferences/server";

export default async function TestServerComponent() {
  console.log("🔍 Testing server action in server component...");
  
  try {
    const data = await getOnboardingData();
    console.log("✅ Server action result:", data);
    console.log("📊 Tracks:", data?.tracks?.length || 0);
    console.log("📝 Topics:", data?.topics?.length || 0);
    
    return (
      <div className="p-4">
        <h1>Server Action Test</h1>
        <div>Tracks: {data?.tracks?.length || 0}</div>
        <div>Topics: {data?.topics?.length || 0}</div>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    );
  } catch (error) {
    console.error("❌ Server action error:", error);
    return (
      <div className="p-4">
        <h1>Server Action Error</h1>
        <pre>{String(error)}</pre>
      </div>
    );
  }
}
