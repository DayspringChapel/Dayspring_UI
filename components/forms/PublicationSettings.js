'use client';
import { localDateTime, utcDateTime } from '@/lib/formStructure';
export default function PublicationSettings({ settings, onChange }) {
    const update = (patch) => onChange({ ...settings, requireApproval: false, showOnWebsite: false, ...patch });
    return <fieldset><legend>Sharing and response collection</legend>
        <p>Every form has its own respondent page. Publish and share its link directly. No approval is required.</p>
        <label>Who can respond?<select value={settings.accessMode || 'Public'} onChange={(e) => update({ accessMode: e.target.value })}><option value="Public">Anyone with the link</option><option value="Authenticated">Signed-in church users</option><option value="Restricted">Invited users only</option></select></label>
        {settings.accessMode === 'Restricted' && <label>Invited user IDs, separated by commas<textarea required value={(settings.allowedUsers || []).join(',')} onChange={(e) => update({ allowedUsers: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} /></label>}
        <p>Optional collection period. Times use your device’s time zone and are stored in UTC. Leave blank to start immediately or collect without an end date.</p>
        {['opensAt', 'closesAt'].map((key) => <label key={key}>{key === 'opensAt' ? 'Start collecting' : 'Stop collecting'}<input type="datetime-local" value={localDateTime(settings[key])} onChange={(e) => update({ [key]: utcDateTime(e.target.value) })} /></label>)}
        <label><input type="checkbox" checked={settings.analysisEnabled !== false} onChange={(e) => update({ analysisEnabled: e.target.checked })} />Enable basic response analysis</label>
    </fieldset>;
}
