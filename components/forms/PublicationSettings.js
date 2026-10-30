'use client';
export default function PublicationSettings({ settings, onChange }) {
    const update = (patch) => onChange({ ...settings, ...patch });
    return <fieldset><legend>Access and publication</legend>
        <label><input type="checkbox" checked={!!settings.showOnWebsite} onChange={(e) => update({ showOnWebsite: e.target.checked })} />Show on church website during the submission period</label>
        <label><input type="checkbox" checked={!!settings.requireApproval} onChange={(e) => update({ requireApproval: e.target.checked })} />Require approval before publication</label>
        <label>Access<select value={settings.accessMode || 'Public'} onChange={(e) => update({ accessMode: e.target.value })}><option value="Public">Public</option><option value="Authenticated">Signed-in users</option><option value="Restricted">Invited users only</option></select></label>
        {settings.accessMode === 'Restricted' && <label>Invited user IDs, separated by commas<textarea required value={(settings.allowedUsers || []).join(',')} onChange={(e) => update({ allowedUsers: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} /></label>}
        <label>Time zone<input required value={settings.timeZone || 'Africa/Lagos'} onChange={(e) => update({ timeZone: e.target.value })} /></label>
        <p>Opening and closing times below use UTC. A closed period prevents submissions even when background workers are unavailable.</p>
        {['opensAt', 'closesAt'].map((key) => <label key={key}>{key === 'opensAt' ? 'Opens at (UTC)' : 'Closes at (UTC)'}<input type="datetime-local" value={settings[key] ? settings[key].slice(0, 16) : ''} onChange={(e) => update({ [key]: e.target.value ? `${e.target.value}:00Z` : null })} /></label>)}
    </fieldset>;
}
