import Nav from "@/ui/Nav-client";

export default function NotFound() {
  return (
    <>
      <Nav />
      <div className="flex h-screen w-full items-center justify-center gap-7">
        <h1 className="text-5xl font-bold">404</h1>
        <div>
          <h2>This page could not be found.</h2>
        </div>
      </div>
    </>
  );
}
