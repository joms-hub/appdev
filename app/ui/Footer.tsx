import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black px-6 py-12 text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="mb-4 flex items-center space-x-3">
            <Image
              src="/favicon.ico"
              alt="DevMate Logo"
              width={30}
              height={30}
              className="rounded-full"
            />
            <span className="text-2xl font-bold">DevMate</span>
          </div>
          <p className="text-sm text-gray-400">
            Empowering future developers with the right tools and guidance.
          </p>
        </div>

        <div>
          <h4 className="mb-3 text-lg font-semibold uppercase">Explore</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>
              <Link href="/#features">Features</Link>
            </li>
            <li>
              <Link href="/#how-it-works">How it Works</Link>
            </li>
            <li>
              <Link href="/tracks">Tracks</Link>
            </li>
            <li>
              <Link href="/faq">FAQ</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-lg font-semibold uppercase">Resources</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>
              <Link href="/about">About Us</Link>
            </li>
            <li>
              <Link href="/privacy-policy">Privacy Policy</Link>
            </li>
            <li>
              <Link href="/terms">Terms of Service</Link>
            </li>
            <li>
              <a href="mailto:devmate.support@email.com">Support</a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-lg font-semibold uppercase">Dev Team</h4>
          <div className="flex flex-wrap gap-3">
            {[
              {
                name: "Celian",
                img: "/celian.png",
                link: "https://github.com/Celian4862",
              },
              {
                name: "Jewel",
                img: "/jewel.jpg",
                link: "https://github.com/tobsilog",
              },
              {
                name: "ZXC",
                img: "/zxc.jpg",
                link: "https://github.com/zphrc",
              },
              {
                name: "Jomr",
                img: "/jomr.png",
                link: "https://github.com/joms-hub",
              },
              {
                name: "Jstn",
                img: "/jstn.jpg",
                link: "https://github.com/Peenks",
              },
              {
                name: "KR",
                img: "/kr.png",
                link: "https://github.com/Useradd-Ken",
              },
            ].map((dev) => (
              <a
                key={dev.name}
                href={dev.link}
                target="_blank"
                rel="noopener noreferrer"
                title={dev.name}
              >
                <Image
                  src={dev.img}
                  alt={dev.name}
                  width={32}
                  height={32}
                  className="rounded-full border border-gray-600 transition hover:scale-110"
                />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10 border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
        <div className="mb-2">
          <a
            href="https://github.com/Celian4862/appdev"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-white"
          >
            <Image src="/github.svg" alt="GitHub Icon" width={20} height={20} />
            DevMate GitHub
          </a>
        </div>
        <div>© {new Date().getFullYear()} DevMate. All rights reserved.</div>
      </div>
    </footer>
  );
}
