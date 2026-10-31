import FormWorkspace from '@/components/forms/FormWorkspace';
export default async function Page({ params, searchParams }) { const { id } = await params; const { view } = await searchParams; return <FormWorkspace key={id} id={id} initialTab={view} />; }
