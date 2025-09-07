import Terminal from "./terminal";

export default function Home() {
  return (
    <form>
      <div className="flex min-h-screen flex-col bg-black p-6 text-white">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Activity (Roadmap)</h1>
          <button className="rounded-md bg-white px-4 py-1 text-black hover:bg-gray-200">
            Study Buddy
          </button>
        </div>
        <div className="grid flex-grow grid-cols-1 gap-6 md:grid-cols-2">
          <div className="h-full rounded-lg bg-zinc-900 p-6">
            <h2 className="mb-2 text-xl font-bold">Description</h2>
            <p className="text-sm text-gray-400">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent
              at bibendum dui. Donec commodo lobortis ex nec congue. Etiam
              ultricies purus ut pulvinar feugiat.
            </p>
          </div>
          <div className="flex h-full flex-col">
            <Terminal />
          </div>
        </div>
        <div className="mt-4 text-right">
          <button
            type="submit"
            className="rounded-md bg-white px-6 py-2 text-black hover:bg-gray-200"
          >
            Submit
          </button>
        </div>
      </div>
    </form>
  );
}
