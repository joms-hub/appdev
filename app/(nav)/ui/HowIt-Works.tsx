export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-black px-4 py-12 text-white">
      <div className="mx-auto max-w-6xl text-center">
        <h2 className="mb-4 text-3xl font-bold md:text-4xl">How It Works</h2>
        <p className="mb-12 text-gray-300">
          A simple 3-step process to get you started with DevMate.
        </p>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col items-center text-center">
            <a href="/login">
              <div className="mb-4 rounded-full bg-white p-4 text-black">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </a>
            <h3 className="mb-2 text-xl font-semibold">Sign Up</h3>
            <p className="text-gray-400">
              Create your free account in minutes with just your email and a
              password.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <a href="/login">
              <div className="mb-4 rounded-full bg-white p-4 text-black">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16l-4-4 4-4m8 8l4-4-4-4"
                  />
                </svg>
              </div>
            </a>
            <h3 className="mb-2 text-xl font-semibold">Choose Track</h3>
            <p className="text-gray-400">
              Select the tools and features that fit your workflow and needs.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <a href="/login">
              <div className="mb-4 rounded-full bg-white p-4 text-black">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
            </a>
            <h3 className="mb-2 text-xl font-semibold">Start Using DevMate</h3>
            <p className="text-gray-400">
              Access your dashboard and explore features right away. You&apos;re
              all set!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
