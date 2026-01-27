export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-mcg-primary to-mcg-dark">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-white">
          <h1 className="text-5xl font-bold mb-4">
            Mayo Coaching Golf
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Premium golf instruction from Joseph Mayo and MCG Alumni coaches
          </p>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {/* Feature Cards */}
            <div className="bg-white/10 backdrop-blur rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2 text-mcg-secondary">
                Swing Reviews
              </h3>
              <p className="text-gray-300">
                Get personalized video analysis from expert coaches,
                including Joseph Mayo himself.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2 text-mcg-secondary">
                Live Lessons
              </h3>
              <p className="text-gray-300">
                Book 1-on-1 video lessons with MCG Alumni coaches
                to accelerate your improvement.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2 text-mcg-secondary">
                Membership Tiers
              </h3>
              <p className="text-gray-300">
                Choose the plan that fits your goals, from free access
                to elite VIP coaching.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
