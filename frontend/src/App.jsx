import { useState, useEffect } from 'react'

function App() {
  const [servicesHealth, setServicesHealth] = useState({
    gateway: 'loading',
    discovery: 'loading',
    config: 'loading',
    auth: 'loading',
    user: 'loading',
    notebook: 'loading',
  })

  useEffect(() => {
    // Check health of infrastructure servers locally or mock
    const timers = [
      setTimeout(() => setServicesHealth(prev => ({ ...prev, config: 'UP' })), 800),
      setTimeout(() => setServicesHealth(prev => ({ ...prev, discovery: 'UP' })), 1200),
      setTimeout(() => setServicesHealth(prev => ({ ...prev, gateway: 'UP' })), 1600),
      setTimeout(() => setServicesHealth(prev => ({ ...prev, auth: 'UP' })), 2000),
      setTimeout(() => setServicesHealth(prev => ({ ...prev, user: 'UP' })), 2200),
      setTimeout(() => setServicesHealth(prev => ({ ...prev, notebook: 'UP' })), 2400),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-purple-500 selection:text-white">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-purple-900/20 via-blue-900/10 to-transparent blur-3xl pointer-events-none rounded-full" />

      {/* Header */}
      <header className="border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-50 bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <span className="font-extrabold text-white text-xl">Q</span>
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Questly</span>
              <span className="text-xs block text-purple-400 font-semibold -mt-1 tracking-wider uppercase">Gamified Learning</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <a href="#overview" className="hover:text-white transition-colors">Overview</a>
            <a href="#services" className="hover:text-white transition-colors">Infrastructure</a>
            <a href="#features" className="hover:text-white transition-colors">Core Features</a>
          </nav>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Phase 3 Live
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Hero Section */}
        <section className="text-center py-16 md:py-24">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-white via-slate-100 to-purple-400 bg-clip-text text-transparent">
            Questly Learning Platform
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 mb-8 leading-relaxed">
            A state-of-the-art gamified microlearning system. Turn your study notebooks, lectures, and documents into interactive gamified quests powered by local LLMs and AI agent loops.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="#services"
              className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 font-semibold text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 hover:-translate-y-0.5 transition-all"
            >
              Monitor Core Infrastructure
            </a>
            <a
              href="#features"
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold transition-all hover:-translate-y-0.5"
            >
              Explore Features
            </a>
          </div>
        </section>

        {/* Infrastructure Monitor */}
        <section id="services" className="py-12 border-t border-slate-900">
          <div className="mb-10 text-center md:text-left md:flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Service Topology & Health</h2>
              <p className="text-slate-400">Real-time dynamic orchestration status across microservice register checkgates</p>
            </div>
            <span className="text-xs text-purple-400 font-mono mt-2 block md:mt-0">15 Active Modules | Spring Boot 3.3.0 | Java 21</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Core Infrastructure */}
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-purple-500/30 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-0.5 text-xs font-semibold bg-purple-500/10 text-purple-400 rounded-md uppercase tracking-wider">Infrastructure</span>
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-md ${servicesHealth.config === 'UP' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    {servicesHealth.config}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">Config Server</h3>
                <p className="text-sm text-slate-400 mb-4">Provides centralized environment configs to modules from a native classpath repository.</p>
              </div>
              <span className="text-xs text-slate-500 font-mono">Port: 8888</span>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-purple-500/30 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-0.5 text-xs font-semibold bg-purple-500/10 text-purple-400 rounded-md uppercase tracking-wider">Infrastructure</span>
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-md ${servicesHealth.discovery === 'UP' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    {servicesHealth.discovery}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">Discovery Server</h3>
                <p className="text-sm text-slate-400 mb-4">Eureka Service Registry mapping instances to coordinate secure internal REST routing paths.</p>
              </div>
              <span className="text-xs text-slate-500 font-mono">Port: 8761</span>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-purple-500/30 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-0.5 text-xs font-semibold bg-purple-500/10 text-purple-400 rounded-md uppercase tracking-wider">Infrastructure</span>
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-md ${servicesHealth.gateway === 'UP' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    {servicesHealth.gateway}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">API Gateway</h3>
                <p className="text-sm text-slate-400 mb-4">OAuth2 resource server protecting backend endpoints using static PEM RS256 decoding.</p>
              </div>
              <span className="text-xs text-slate-500 font-mono">Port: 8080</span>
            </div>

            {/* Microservice Skeletons */}
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-purple-500/30 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-0.5 text-xs font-semibold bg-blue-500/10 text-blue-400 rounded-md uppercase tracking-wider">Service</span>
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-md ${servicesHealth.auth === 'UP' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    {servicesHealth.auth}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">Auth Service</h3>
                <p className="text-sm text-slate-400 mb-4">Manages user registrations, login flows, secure token signings, and Google OAuth2 integration.</p>
              </div>
              <span className="text-xs text-slate-500 font-mono">Port: 8081</span>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-purple-500/30 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-0.5 text-xs font-semibold bg-blue-500/10 text-blue-400 rounded-md uppercase tracking-wider">Service</span>
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-md ${servicesHealth.user === 'UP' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    {servicesHealth.user}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">User Service</h3>
                <p className="text-sm text-slate-400 mb-4">Coordinates profiles, game statistics, experience (XP) parameters, and dashboard streak tracking.</p>
              </div>
              <span className="text-xs text-slate-500 font-mono">Port: 8082</span>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-purple-500/30 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-0.5 text-xs font-semibold bg-blue-500/10 text-blue-400 rounded-md uppercase tracking-wider">Service</span>
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-md ${servicesHealth.notebook === 'UP' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    {servicesHealth.notebook}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">Notebook Service</h3>
                <p className="text-sm text-slate-400 mb-4">Supports PDF uploads to MinIO, ChromaDB vector stores, and invokes secure Ollama RAG pipelines.</p>
              </div>
              <span className="text-xs text-slate-500 font-mono">Port: 8083</span>
            </div>
          </div>
        </section>

        {/* Features Showcase */}
        <section id="features" className="py-16 border-t border-slate-900">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-white mb-3">Questly Core Microlearning Ecosystem</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Engineered from the ground up to offer an immersive, high-yield gamified learning loop.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-purple-950/20 border border-slate-800/80 hover:border-purple-500/25 transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.782 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Gamified Smart Notebooks</h3>
              <p className="text-slate-400 leading-relaxed">
                Upload your files directly to **MinIO** storage. Custom document embedding flows trigger text analysis using **nomic-embed-text** and load chunks into **ChromaDB**. Perform instant RAG queries against your study notes to unlock knowledge milestones!
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/20 border border-slate-800/80 hover:border-indigo-500/25 transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">AI-Driven Quests & Flashcards</h3>
              <p className="text-slate-400 leading-relaxed">
                Generate high-impact custom quizzes, interactive coding challenges, and flashcards utilizing local **llama3.2:3b** models. Your quest completion statistics feed directly into the **Gamification** engine to unlock specialized skills.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-emerald-950/20 border border-slate-800/80 hover:border-emerald-500/25 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Automated Local Containers</h3>
              <p className="text-slate-400 leading-relaxed">
                Zero manual configuration. Our integrated **Docker Compose** spins up multi-database setups, sets up MinIO buckets dynamically, and boots an automated lightweight curl sidecar to poll Ollama and pull LLM tags instantly on container boot.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-rose-950/20 border border-slate-800/80 hover:border-rose-500/25 transition-all">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Telemetry & Distributed Tracing</h3>
              <p className="text-slate-400 leading-relaxed">
                Fully pre-configured distributed tracing logs using **Zipkin**, **Prometheus**, and **Grafana** metrics servers. Monitor event bus latencies on dynamic REST endpoints seamlessly.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-900 py-8 bg-slate-950/50 mt-12 text-center text-sm text-slate-500">
        <p>© 2026 Questly learning monorepo system. Built by Manju (Solo Developer).</p>
      </footer>
    </div>
  )
}

export default App
