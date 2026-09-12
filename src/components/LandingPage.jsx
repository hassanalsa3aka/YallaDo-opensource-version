import googleLogo from "../assets/google.png";
import Logo from "./Logo";

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-accent-fg shrink-0">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const MiniColumn = ({ label, dot, cards }) => (
  <div className="flex-1 min-w-[100px] bg-ink-900 border border-ink-900 rounded-sm p-2">
    <div className="flex items-center gap-1.5 text-[10px] font-mono font-medium uppercase tracking-wide text-text-muted mb-2">
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </div>
    <div className="space-y-1.5">
      {cards.map((card) => (
        <div key={card} className="bg-paper border border-paper-line rounded-sm px-2 py-1.5 text-[11px] text-ink-900 shadow-[2px_2px_0_0_rgba(19,19,17,0.15)]">
          {card}
        </div>
      ))}
    </div>
  </div>
);

const BoardPreview = () => (
  <div className="relative">
    <div className="absolute z-10 top-3 right-3 font-mono text-[11px] uppercase tracking-wider text-accent bg-ink-900 border border-accent/50 rounded-sm px-2 py-1 rotate-2 hidden sm:block">
      live board
    </div>
    <div className="bg-paper border-2 border-ink-900 rounded-md shadow-card-lg p-4 sm:p-5 -rotate-1">
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-paper-line">
        <span className="w-2.5 h-2.5 rounded-full bg-stone" />
        <span className="w-2.5 h-2.5 rounded-full bg-accent" />
        <span className="w-2.5 h-2.5 rounded-full bg-jade" />
        <span className="text-xs font-mono text-text-faint ml-2">marketing-launch.board</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1">
        <MiniColumn label="Todo" dot="bg-stone" cards={["Draft launch email", "Line up influencers"]} />
        <MiniColumn label="In progress" dot="bg-accent" cards={["Landing page copy"]} />
        <MiniColumn label="Closed" dot="bg-jade" cards={["Confirm budget"]} />
      </div>
    </div>
  </div>
);

const TaskDetailPreview = () => (
  <div className="bg-paper border-2 border-ink-900 rounded-md shadow-card-lg p-5 rotate-1">
    <div className="flex items-center justify-between gap-3 mb-3">
      <h4 className="font-display font-bold text-ink-900 text-base">Fix onboarding crash</h4>
      <span className="text-[10px] font-mono font-semibold uppercase tracking-wide bg-accent-soft text-accent-deep rounded-sm px-2 py-0.5 shrink-0">
        In progress
      </span>
    </div>
    <div className="flex items-center gap-4 mb-3 text-xs text-text-faint font-mono">
      <div className="flex">
        {["AK", "DT"].map((who) => (
          <div
            key={who}
            className="w-6 h-6 -ml-1.5 first:ml-0 rounded-full bg-ink-900 text-paper text-[9px] font-bold flex items-center justify-center border-2 border-paper"
          >
            {who}
          </div>
        ))}
      </div>
      <span>Due Sep 3</span>
    </div>
    <div className="border-t border-paper-line pt-3 space-y-2">
      <div className="flex gap-2">
        <div className="w-5 h-5 rounded-full bg-ink-900/10 shrink-0" />
        <div className="bg-paper-dim rounded-sm px-2 py-1 text-xs text-ink-900">Repro&apos;d on iOS 17 only</div>
      </div>
      <div className="flex gap-2">
        <div className="w-5 h-5 rounded-full bg-ink-900/10 shrink-0" />
        <div className="bg-paper-dim rounded-sm px-2 py-1 text-xs text-ink-900">Pushed a fix, can you verify?</div>
      </div>
    </div>
  </div>
);

const STEPS = [
  {
    title: "Sign in with Google",
    description: "No new password, no separate account — you're in with the Google account you already use.",
  },
  {
    title: "Open My Tasks or start a workspace",
    description: "Begin with your personal board, or create a workspace the moment a project needs a team.",
  },
  {
    title: "Invite people and assign work",
    description: "Share an invite link, assign tasks to more than one person, and set a due date.",
  },
];

const FAQS = [
  {
    q: "Is my personal to-do list private?",
    a: "Yes. My Tasks is a personal workspace only you can see — it's separate from team workspaces, which are only visible to people you invite.",
  },
  {
    q: "How do teammates join a workspace?",
    a: "Generate an invite link from inside a workspace and share it. Anyone who opens it while signed in joins automatically — invite links expire after 7 days.",
  },
  {
    q: "What happens if I delete a workspace?",
    a: "It permanently removes all of its tasks and comments and removes access for everyone in it. This can't be undone.",
  },
  {
    q: "Is it free?",
    a: "Yes — sign in with Google and start using it. No plan to pick, no card required.",
  },
];

const FEATURES = [
  {
    title: "Your own board",
    description: "A personal to-do list that's just for you — nobody else sees it unless you invite them.",
    path: "M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z",
  },
  {
    title: "Team workspaces",
    description: "Spin up a workspace per project, invite teammates with a link, and see who has access at a glance.",
    path: "M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z",
  },
  {
    title: "Full task detail",
    description: "Assign more than one person, set a due date, and talk through the work right on the task.",
    path: "M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155",
  },
];

const GoogleButton = ({ onClick, tone = "accent", className = "" }) => {
  const toneClasses =
    tone === "accent"
      ? "bg-accent hover:bg-accent-dim text-accent-ink"
      : "bg-paper hover:bg-paper-dim text-ink-900";
  return (
    <button
      onClick={onClick}
      className={`group inline-flex items-center gap-3 font-sans font-semibold rounded-sm pl-3 pr-5 py-3 text-base shadow-card border-2 border-ink-900 transition-all duration-200 ease-spring hover:-translate-y-0.5 hover:shadow-card-hover active:translate-y-0 active:shadow-none ${toneClasses} ${className}`}
    >
      <img src={googleLogo} alt="" className="w-6 h-6 bg-white rounded-full p-1 object-contain" />
      Continue with Google
    </button>
  );
};

const LandingPage = ({ onLogin }) => {
  return (
    <div className="bg-ink w-full overflow-hidden">
      <section className="relative bg-grain max-w-6xl mx-auto px-6 pt-14 md:pt-20 pb-20 grid md:grid-cols-2 gap-14 items-center">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-mono font-medium uppercase tracking-[0.15em] text-accent-fg mb-5 border border-accent/40 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            Personal &amp; team task tracking
          </p>
          <h1 className="font-display text-5xl md:text-6xl font-bold leading-[1.05] mb-6 text-balance">
            One board for your tasks.
            <br />
            <span className="italic text-accent-fg">Another</span> for your team.
          </h1>
          <p className="text-text-muted text-lg mb-9 max-w-md leading-relaxed">
            Keep a private to-do list for yourself, and open a workspace whenever a project needs more than one
            person — status, assignees, due dates, and comments, all in one place.
          </p>
          <GoogleButton onClick={onLogin} />
          <p className="text-xs font-mono text-text-muted mt-4">No credit card, no setup — just sign in.</p>
        </div>

        <BoardPreview />
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid sm:grid-cols-3 border-t-2 border-line-strong">
          {FEATURES.map((feature, index) => (
            <div
              key={feature.title}
              className={`p-6 border-b-2 border-line-strong sm:border-b-0 ${index < FEATURES.length - 1 ? "sm:border-r-2 sm:border-line-strong" : ""}`}
            >
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-xs text-text-muted">0{index + 1}</span>
                <div className="w-9 h-9 rounded-sm bg-accent-soft text-accent-fg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d={feature.path} />
                  </svg>
                </div>
              </div>
              <h3 className="font-display font-semibold text-xl text-text mb-2">{feature.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="mb-12">
          <p className="text-xs font-mono font-medium uppercase tracking-[0.15em] text-accent-fg mb-3">How it works</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-balance max-w-xl">
            From sign-in to shipped, in three steps
          </h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-10">
          {STEPS.map((step, index) => (
            <div key={step.title} className="relative pl-0">
              <div className="font-display text-6xl font-bold text-transparent [-webkit-text-stroke:1.5px_theme(colors.line-strong)] mb-3">
                0{index + 1}
              </div>
              <h3 className="font-semibold text-text mb-2">{step.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24 grid md:grid-cols-2 gap-14 items-center">
        <TaskDetailPreview />
        <div>
          <p className="text-xs font-mono font-medium uppercase tracking-[0.15em] text-accent-fg mb-3">Every task, fully detailed</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6 text-balance">
            Not just a checklist — the whole conversation
          </h2>
          <ul className="space-y-4">
            <li className="flex items-start gap-3 text-text-muted">
              <CheckIcon />
              Assign more than one person to a task
            </li>
            <li className="flex items-start gap-3 text-text-muted">
              <CheckIcon />
              Track status, due dates, and a full description
            </li>
            <li className="flex items-start gap-3 text-text-muted">
              <CheckIcon />
              Discuss the work in comments, right on the task
            </li>
          </ul>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-24">
        <div className="mb-10">
          <p className="text-xs font-mono font-medium uppercase tracking-[0.15em] text-accent-fg mb-3">Questions</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold">Good to know</h2>
        </div>
        <div className="border-t-2 border-line-strong">
          {FAQS.map((faq, index) => (
            <div key={faq.q} className="py-6 border-b-2 border-line-strong flex gap-5">
              <span className="font-mono text-xs text-text-muted pt-1 shrink-0">Q{index + 1}</span>
              <div>
                <h3 className="font-semibold text-text mb-1.5">{faq.q}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative bg-accent bg-grain">
        <div className="max-w-5xl mx-auto px-6 pt-20 pb-14 text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-accent-ink mb-4 text-balance">
            Ready to get your tasks out of your head?
          </h2>
          <p className="text-accent-ink/70 mb-8 font-medium">Sign in and your personal board is ready in seconds.</p>
          <GoogleButton onClick={onLogin} tone="paper" />
        </div>
        <footer className="max-w-5xl mx-auto px-6 py-6 border-t-2 border-ink-900/15 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo wordClassName="text-accent-ink" markClassName="bg-ink-900 text-accent border border-ink-900/15" />
          <span className="text-xs font-mono text-accent-ink/70">&copy; {new Date().getFullYear()} YallaDo — built for focused work</span>
        </footer>
      </section>
    </div>
  );
};

export default LandingPage;
