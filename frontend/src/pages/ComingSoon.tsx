export default function ComingSoon({ title, phase }: { title: string; phase: number }) {
  return (<div className="card p-8"><h1 className="text-xl font-semibold">{title}</h1>
    <p className="mt-2 text-sm text-mute">Not built yet. This page ships in Phase {phase}.</p></div>);
}
