export default async function Agent({
  params,
}: {
  params: Promise<{ agent: string }>;
}) {
  const { agent } = await params;
  return <div>Agent: {agent}</div>;
}
