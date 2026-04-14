import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Host your game servers with zero hassle
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Deploy, manage, and scale your favorite game servers instantly on Google Cloud Kubernetes. Complete control from your desktop or mobile device.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/dashboard"
                className="rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
              >
                Go to Dashboard
              </Link>
              <Link href="/pricing" className="text-sm font-semibold leading-6 text-white">
                View Pricing <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
