import { useRef, useState } from 'react'
import { Camera, CheckCircle2, ImagePlus, Lock, RefreshCw } from 'lucide-react'
import { useStore } from '../store'
import { dateTime } from '../lib/format'
import { Badge, Button, Card, EmptyState, Field, Note, ScreenHeader, SectionTitle, toast } from '../components/ui'

// Shrinks the image in the browser so the demo can keep it in local storage.
function toDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, 640 / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d')
      URL.revokeObjectURL(url)
      if (!ctx) return reject(new Error('no canvas'))
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', 0.72))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('unreadable'))
    }
    img.src = url
  })
}

export default function Photo() {
  const { photos, addPhoto } = useStore()
  const camera = useRef<HTMLInputElement>(null)
  const gallery = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setSent(false)
    if (!file.type.startsWith('image/')) return setError('Please choose a photo (JPG, PNG or HEIC).')
    if (file.size > 15 * 1024 * 1024) return setError('That photo is larger than 15 MB. Please choose a smaller one.')
    try {
      setPreview(await toDataUrl(file))
      setError(null)
    } catch {
      setError("We couldn't open that photo. Please try a different one.")
    }
  }

  const submit = () => {
    if (!preview) return
    try {
      addPhoto(preview, note.trim())
      setPreview(null)
      setNote('')
      setSent(true)
    } catch {
      toast('Your photo could not be sent. Please try again.', 'error')
    }
  }

  return (
    <div className="pb-6">
      <ScreenHeader title="Share a recovery photo" subtitle="If your care team has asked you to send a photo, you can submit it here for review." />
      <div className="space-y-4 px-4">
        <Note tone="amber">Demo only. Please use a non-clinical picture, such as a photo of an object. Photos stay in this browser and are not sent anywhere.</Note>

        {sent && (
          <div role="status" className="fade-in flex items-center gap-3 rounded-2xl bg-softteal p-4">
            <CheckCircle2 size={28} className="shrink-0 text-tealdark" aria-hidden />
            <div><p className="font-bold text-tealdark">Photo submitted for review.</p><p className="text-sm text-ink">You can see its status below.</p></div>
          </div>
        )}

        <input ref={camera} type="file" accept="image/*" capture="environment" className="hidden" onChange={pick} aria-hidden tabIndex={-1} />
        <input ref={gallery} type="file" accept="image/*" className="hidden" onChange={pick} aria-hidden tabIndex={-1} />

        {preview ? (
          <Card className="space-y-4">
            <h2 className="text-lg font-bold text-navy">Preview</h2>
            <img src={preview} alt="Preview of the photo you chose" className="max-h-72 w-full rounded-xl bg-bg object-contain" />
            <Button small variant="outline" onClick={() => gallery.current?.click()}><RefreshCw size={16} aria-hidden /> Choose a different photo</Button>
            <Field label="Add a note (optional)"><textarea rows={2} maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} /></Field>
            <Button full onClick={submit}>Submit to Care Team</Button>
            <Button full variant="ghost" onClick={() => setPreview(null)}>Cancel</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Button className="!min-h-[6rem] flex-col" onClick={() => camera.current?.click()}><Camera size={28} aria-hidden /> Take Photo</Button>
            <Button variant="secondary" className="!min-h-[6rem] flex-col" onClick={() => gallery.current?.click()}><ImagePlus size={28} aria-hidden /> Choose From Gallery</Button>
          </div>
        )}
        {error && <p role="alert" className="rounded-xl bg-softred p-3 font-medium text-danger">{error}</p>}
        <p className="text-sm text-muted">If your camera does not open, check that this browser is allowed to use it, or choose a photo from your gallery instead.</p>

        <Card className="flex gap-3">
          <Lock size={20} className="mt-0.5 shrink-0 text-tealdark" aria-hidden />
          <p className="text-sm text-ink">Photos are looked at by a member of staff, not by software. The app never analyses a photo or suggests a diagnosis.</p>
        </Card>

        <div>
          <SectionTitle>Your submissions</SectionTitle>
          {photos.length === 0 ? (
            <EmptyState title="No photos submitted" body="Photos you send will be listed here with their review status." />
          ) : (
            <ul className="space-y-3">
              {photos.map((p) => (
                <Card as="li" key={p.id} className="flex gap-3">
                  <img src={p.dataUrl} alt="Submitted photo thumbnail" className="h-20 w-20 shrink-0 rounded-xl bg-bg object-cover" />
                  <div className="min-w-0 flex-1">
                    <Badge tone={p.status === 'Reviewed' ? 'teal' : p.status === 'Awaiting Review' ? 'amber' : 'blue'}>{p.status}</Badge>
                    <p className="mt-1 text-sm text-muted">Submitted {dateTime(p.at)}</p>
                    {p.status === 'Reviewed' && p.reviewedAt && <p className="text-sm text-muted">Reviewed {dateTime(p.reviewedAt)} by {p.reviewedBy} (demo staff)</p>}
                    {p.note && <p className="mt-1 text-sm text-ink">“{p.note}”</p>}
                  </div>
                </Card>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
