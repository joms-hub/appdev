export default function Tracks() {
  const tracks = [
    {
      title: "Data Analytics",
      description:
        "Dive into data with Python & Analyze, visualize, and tell data stories.",
      icon: (
        <svg
          className="h-8 w-8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11 3v18m4-10v10m-8-4v4M4 21h16"
          />
        </svg>
      ),
    },
    {
      title: "Programming Foundations",
      description:
        "Master programming logic with C, Python and data structures to build solid foundations.",
      icon: (
        <svg
          className="h-8 w-8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12h6m2 0a8 8 0 11-16 0 8 8 0 0116 0z"
          />
        </svg>
      ),
    },
    {
      title: "Programming Foundations",
      description:
        "Master programming logic with C, Python and data structures to build solid foundations.",
      icon: (
        <svg
          className="h-8 w-8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12h6m2 0a8 8 0 11-16 0 8 8 0 0116 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <section id="tracks" className="bg-black px-6 py-16 text-white">
      <div className="mx-auto max-w-6xl text-center">
        <h2 className="mb-6 text-3xl font-bold md:text-4xl">
          Explore Learning Tracks
        </h2>
        <p className="mb-12 text-gray-300">
          Choose a path based on your interests and career goals{" "}
          <span>with the help of AI</span>.
        </p>

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {tracks.map((track, index) => (
            <div
              key={index}
              className="rounded-xl border border-white/10 bg-white/5 p-6 text-left transition hover:border-white/30"
            >
              <div className="mb-4 text-blue-400">{track.icon}</div>
              <h3 className="mb-2 text-xl font-semibold">{track.title}</h3>
              <p className="text-gray-400">{track.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
