import googleLogo from "../assets/google.png";
import logo from "../assets/logo.png";

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-cyan-600 shrink-0">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const MiniColumn = ({ label, dot, cards }) => (
  <div className="flex-1 min-w-[92px] bg-slate-50 border border-slate-200 rounded-md p-2">
    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-2">
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </div>
    <div className="space-y-1.5">
      {cards.map((card) => (
        <div key={card} className="bg-white border border-slate-200 rounded px-2 py-1.5 text-[11px] text-slate-600 shadow-sm">
          {card}
        </div>
      ))}
    </div>
  </div>
);

const BoardPreview = () => (
  <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 rotate-0">
    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100">
      <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
      <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
      <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
      <span className="text-xs text-slate-400 ml-2">Marketing Launch</span>
    </div>
    <div className="flex gap-3 overflow-x-auto pb-1">
      <MiniColumn label="Todo" dot="bg-slate-400" cards={["Draft launch email", "Line up influencers"]} />
      <MiniColumn label="In progress" dot="bg-purple-500" cards={["Landing page copy"]} />
      <MiniColumn label="Closed" dot="bg-green-500" cards={["Confirm budget"]} />
    </div>
  </div>
);

const TaskDetailPreview = () => (
  <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
    <div className="flex items-center justify-between gap-3 mb-3">
      <h4 className="font-bold text-slate-800 text-sm">Fix onboarding crash</h4>
      <span className="text-[10px] font-bold uppercase tracking-wide bg-purple-100 text-purple-700 rounded-full px-2 py-0.5 shrink-0">
        In progress
      </span>
    </div>
    <div className="flex items-center gap-4 mb-3 text-xs text-slate-500">
      <div className="flex">
        {["AK", "DT"].map((who) => (
          <div
            key={who}
            className="w-5 h-5 -ml-1 first:ml-0 rounded-full bg-cyan-100 text-cyan-700 text-[9px] font-bold flex items-center justify-center border border-white"
          >
            {who}
          </div>
        ))}
      </div>
      <span>Due Sep 3</span>
    </div>
    <div className="border-t border-slate-100 pt-3 space-y-2">
      <div className="flex gap-2">
        <div className="w-5 h-5 rounded-full bg-slate-200 shrink-0" />
        <div className="bg-slate-50 rounded px-2 py-1 text-xs text-slate-600">Repro&apos;d on iOS 17 only</div>
      </div>
      <div className="flex gap-2">
        <div className="w-5 h-5 rounded-full bg-slate-200 shrink-0" />
        <div className="bg-slate-50 rounded px-2 py-1 text-xs text-slate-600">Pushed a fix, can you verify?</div>
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

const LandingPage = ({ onLogin }) => {
  return (
    <div className="bg-slate-100 w-full">
      <section className="max-w-5xl mx-auto px-6 pt-16 md:pt-24 pb-16 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-cyan-700 mb-3">Personal &amp; team task tracking</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 leading-tight mb-5 text-balance">
            One board for your tasks. Another for your team.
          </h1>
          <p className="text-slate-600 text-lg mb-8 max-w-md">
            Keep a private to-do list for yourself, and open a workspace whenever a project needs more than one
            person — status, assignees, due dates, and comments, all in one place.
          </p>
          <button
            onClick={onLogin}
            className="inline-flex items-center gap-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-md pl-4 pr-6 py-3 text-base shadow-sm"
          >
            <img src={googleLogo} alt="" className="w-6 h-6 bg-white rounded-full p-0.5" />
            Continue with Google
          </button>
          <p className="text-xs text-slate-400 mt-3">Free to use. No credit card, no setup — just sign in.</p>
        </div>

        <BoardPreview />
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid sm:grid-cols-3 gap-6">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="bg-white border border-slate-200 rounded-lg p-5">
              <div className="w-9 h-9 rounded-md bg-cyan-50 text-cyan-700 flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d={feature.path} />
                </svg>
              </div>
              <h3 className="font-bold text-slate-800 mb-1.5">{feature.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-wide text-cyan-700 mb-2">How it works</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 text-balance">From sign-in to shipped, in three steps</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-8">
          {STEPS.map((step, index) => (
            <div key={step.title}>
              <div className="text-4xl font-extrabold text-slate-300 mb-2">0{index + 1}</div>
              <h3 className="font-bold text-slate-800 mb-1.5">{step.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-20 grid md:grid-cols-2 gap-12 items-center">
        <TaskDetailPreview />
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-cyan-700 mb-3">Every task, fully detailed</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-4 text-balance">
            Not just a checklist — the whole conversation
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-2 text-slate-600">
              <CheckIcon />
              Assign more than one person to a task
            </li>
            <li className="flex items-start gap-2 text-slate-600">
              <CheckIcon />
              Track status, due dates, and a full description
            </li>
            <li className="flex items-start gap-2 text-slate-600">
              <CheckIcon />
              Discuss the work in comments, right on the task
            </li>
          </ul>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-20">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-wide text-cyan-700 mb-2">Questions</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800">Good to know</h2>
        </div>
        <div className="space-y-4">
          {FAQS.map((faq) => (
            <div key={faq.q} className="bg-white border border-slate-200 rounded-lg p-5">
              <h3 className="font-bold text-slate-800 mb-1.5">{faq.q}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-800">
        <div className="max-w-5xl mx-auto px-6 pt-16 pb-10 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3 text-balance">
            Ready to get your tasks out of your head?
          </h2>
          <p className="text-slate-300 mb-6">Sign in and your personal board is ready in seconds.</p>
          <button
            onClick={onLogin}
            className="inline-flex items-center gap-3 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold rounded-md pl-4 pr-6 py-3"
          >
            <img src={googleLogo} alt="" className="w-6 h-6 bg-white rounded-full p-0.5" />
            Continue with Google
          </button>
        </div>
        <footer className="max-w-5xl mx-auto px-6 py-6 mt-6 border-t border-slate-700 flex items-center justify-between gap-4">
          <img src={logo} alt="To-Do" className="h-5" />
          <span className="text-xs text-slate-400">&copy; {new Date().getFullYear()} To-Do</span>
        </footer>
      </section>
    </div>
  );
};

export default LandingPage;
