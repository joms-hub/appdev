export default function FAQ() {
  return (
    <>
      <section id="faq" className="bg-black text-white">
        <div className="container mx-auto flex h-150 flex-col justify-center px-4 py-8 md:p-8">
          <h2 className="text-2xl font-semibold sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 mb-8 text-white">
            Sagittis tempor donec id vestibulum viverra. Neque condimentum
            primis orci at lacus amet bibendum.
          </p>
          <div className="space-y-4">
            <details className="w-full rounded-lg border border-white hover:cursor-pointer">
              <summary className="px-4 py-6 focus:outline-none">
                Ex orci laoreet egestas sapien magna egestas scelerisque?
              </summary>
              <p className="-mt-4 ml-4 px-4 py-6 pt-0 text-white">
                Lectus iaculis orci metus vitae ligula dictum per. Nisl per
                nullam taciti at adipiscing est.
              </p>
            </details>
            <details className="w-full rounded-lg border border-white hover:cursor-pointer">
              <summary className="px-4 py-6 focus:outline-none">
                Lorem at arcu rutrum viverra metus sapien venenatis lobortis
                odio?
              </summary>
              <p className="-mt-4 ml-4 px-4 py-6 pt-0 text-white">
                Tincidunt ut hac condimentum rhoncus phasellus nostra. Magna
                porttitor egestas tincidunt neque vehicula potenti.
              </p>
            </details>
            <details className="w-full rounded-lg border border-white hover:cursor-pointer">
              <summary className="px-4 py-6 focus:outline-none">
                Eleifend feugiat sollicitudin laoreet adipiscing bibendum
                suscipit erat?
              </summary>
              <p className="-mt-4 ml-4 px-4 py-6 pt-0 text-white">
                Justo libero tellus integer tincidunt justo semper consequat
                venenatis aliquet imperdiet. Ultricies urna proin fusce nulla
                pretium sodales vel magna et massa euismod vulputate sed.
              </p>
            </details>
          </div>
        </div>
      </section>
    </>
  );
}
