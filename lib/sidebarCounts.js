export async function fetchSidebarCounts(api, permissions, today = new Date()) {
    const has = permission => permissions.includes(permission);
    const safely = work => work().catch(() => []);
    const [appointments, requisitions, admin, root, birthdays, comments, publishing] = await Promise.all([
        has('CanManageAppointment') ? safely(() => api.getAppointments()) : [],
        has('CanManageRequisition') ? safely(() => api.getRequisitions()) : [],
        has('CanApproveAsAdmin') && !has('CanApproveAsSuperAdmin') ? safely(() => api.getAdminApprovalQueue()) : [],
        has('CanApproveAsSuperAdmin') ? safely(() => api.getSuperAdminApprovalQueue()) : [],
        safely(() => api.getBirthdays()),
        has('CanModerateComments') ? api.getCommentCounts().catch(() => null) : null,
        permissions.some(p=>['CanPublishContent','CanPublishToFacebook','CanPublishToInstagram','CanPublishToX','CanPublishToYouTube','CanPublishToWhatsApp'].includes(p)) ? safely(()=>api.getMediaContentsByStatus(7)) : [],
    ]);
    const birthdayToday = value => {
        if (!value) return false;
        // A birthday is a calendar date, not a UTC instant to shift into another day.
        const match = /^(\d{4})-(\d{2})-(\d{2})(?:$|T)/.exec(value);
        if (match) return Number(match[2]) === today.getMonth()+1 && Number(match[3]) === today.getDate();
        const date = new Date(value); return date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
    };
    return {
        appointments: appointments.filter(item => (item.status ?? 0) === 0).length,
        requisitions: requisitions.filter(item => (item.status ?? 0) === 0).length,
        approvals: new Set([...admin,...root].map(item => item.contentId || item.id)).size,
        publishing: publishing.length,
        birthdays: birthdays.filter(item => birthdayToday(item.dateOfBirth)).length,
        comments: comments?.pending ?? 0,
    };
}
