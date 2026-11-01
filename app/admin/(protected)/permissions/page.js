import AccessStudio from '@/components/admin/AccessStudio';
export default async function PermissionsPage({ searchParams }) {
    const params = await searchParams;
    return <AccessStudio initialTab={params?.tab || 'roles'} />;
}
